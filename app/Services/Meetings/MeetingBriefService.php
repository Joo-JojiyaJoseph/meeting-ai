<?php

namespace App\Services\Meetings;

use App\Enums\ActionItemStatus;
use App\Enums\DecisionStatus;
use App\Enums\MeetingStatus;
use App\Enums\TaskStatus;
use App\Models\Meeting;
use App\Models\MeetingActionItem;
use App\Models\MeetingDecision;
use App\Models\MeetingQuestion;
use App\Models\MeetingRisk;
use App\Models\Task;
use App\Models\User;
use App\Services\AI\SemanticSearchService;
use App\Support\OrganizationContext;
use Throwable;

/**
 * Builds a pre-meeting brief from prior meetings, open work, and (when
 * available) a grounded AI synthesis. Structured data is always returned so
 * the brief is useful even if the AI service is offline.
 */
class MeetingBriefService
{
    public function __construct(
        protected SemanticSearchService $search,
        protected OrganizationContext $context,
    ) {}

    public function build(Meeting $meeting, User $user): array
    {
        $related = $this->relatedMeetings($meeting);
        $relatedIds = $related->pluck('id');
        $emptyRelated = $relatedIds->isEmpty();

        $openTasks = Task::query()
            ->with('assignee')
            ->when(
                $meeting->project_id,
                fn ($q) => $q->where('project_id', $meeting->project_id),
                fn ($q) => $relatedIds->isNotEmpty()
                    ? $q->whereIn('meeting_id', $relatedIds)
                    : $q->whereRaw('1 = 0'),
            )
            ->whereIn('status', [TaskStatus::Pending, TaskStatus::InProgress, TaskStatus::Blocked])
            ->orderBy('due_date')
            ->limit(8)
            ->get();

        $openActions = $emptyRelated ? collect() : MeetingActionItem::query()
            ->with(['assignee', 'meeting'])
            ->whereIn('meeting_id', $relatedIds)
            ->whereIn('status', [ActionItemStatus::Suggested, ActionItemStatus::Accepted])
            ->orderByDesc('priority')
            ->limit(8)
            ->get();

        $decisions = $emptyRelated ? collect() : MeetingDecision::query()
            ->with('meeting')
            ->whereIn('meeting_id', $relatedIds)
            ->where('status', '!=', DecisionStatus::Rejected)
            ->latest()
            ->limit(6)
            ->get();

        $questions = $emptyRelated ? collect() : MeetingQuestion::query()
            ->whereIn('meeting_id', $relatedIds)
            ->where(fn ($q) => $q->where('is_resolved', false)->orWhereNull('is_resolved'))
            ->latest()
            ->limit(6)
            ->get();

        $risks = $emptyRelated ? collect() : MeetingRisk::query()
            ->whereIn('meeting_id', $relatedIds)
            ->where(fn ($q) => $q->whereNull('status')->orWhereNotIn('status', ['closed', 'resolved', 'mitigated']))
            ->latest()
            ->limit(6)
            ->get();

        $talkingPoints = $this->heuristicTalkingPoints($meeting, $openTasks, $openActions, $decisions, $questions, $risks);
        $ai = $this->maybeSynthesize($meeting, $user, $talkingPoints);

        return [
            'meeting' => [
                'id' => $meeting->ulid,
                'title' => $meeting->title,
                'objective' => $meeting->objective,
                'project' => $meeting->project ? [
                    'id' => $meeting->project->ulid,
                    'name' => $meeting->project->name,
                ] : null,
            ],
            'agenda' => $meeting->agendaItems->map(fn ($item) => [
                'title' => $item->title,
                'duration_minutes' => $item->duration_minutes,
            ])->values(),
            'prior_meetings' => $related->map(fn (Meeting $prior) => [
                'id' => $prior->ulid,
                'title' => $prior->title,
                'scheduled_start_at' => $prior->scheduled_start_at,
                'status' => $prior->status?->value ?? $prior->status,
            ])->values(),
            'open_tasks' => $openTasks->map(fn (Task $task) => [
                'id' => $task->ulid,
                'title' => $task->title,
                'assignee' => $task->assignee?->name,
                'due_date' => $task->due_date,
                'priority' => $task->priority?->value ?? $task->priority,
                'status' => $task->status?->value ?? $task->status,
                'is_overdue' => $task->isOverdue(),
            ])->values(),
            'carryover_actions' => $openActions->map(fn (MeetingActionItem $item) => [
                'id' => $item->ulid,
                'title' => $item->title,
                'assignee' => $item->assignee?->name ?? $item->assignee_name_raw,
                'due_date' => $item->due_date,
                'priority' => $item->priority?->value ?? $item->priority,
                'status' => $item->status?->value ?? $item->status,
                'meeting' => $item->meeting ? [
                    'id' => $item->meeting->ulid,
                    'title' => $item->meeting->title,
                ] : null,
            ])->values(),
            'recent_decisions' => $decisions->map(fn (MeetingDecision $decision) => [
                'id' => $decision->ulid,
                'decision' => $decision->decision,
                'topic' => $decision->topic,
                'status' => $decision->status?->value ?? $decision->status,
                'meeting' => $decision->meeting ? [
                    'id' => $decision->meeting->ulid,
                    'title' => $decision->meeting->title,
                ] : null,
            ])->values(),
            'open_questions' => $questions->map(fn (MeetingQuestion $question) => [
                'id' => $question->id,
                'question' => $question->question,
            ])->values(),
            'risks' => $risks->map(fn (MeetingRisk $risk) => [
                'id' => $risk->id,
                'title' => $risk->title,
                'severity' => $risk->severity,
            ])->values(),
            'talking_points' => $ai['talking_points'] ?? $talkingPoints,
            'ai_summary' => $ai['summary'] ?? null,
            'used_ai' => (bool) ($ai['used_ai'] ?? false),
        ];
    }

    protected function relatedMeetings(Meeting $meeting)
    {
        return Meeting::query()
            ->whereKeyNot($meeting->id)
            ->where('status', '!=', MeetingStatus::Cancelled)
            ->when(
                $meeting->project_id,
                fn ($q) => $q->where('project_id', $meeting->project_id),
            )
            ->when(
                $meeting->scheduled_start_at,
                fn ($q) => $q->where('scheduled_start_at', '<', $meeting->scheduled_start_at),
            )
            ->orderByDesc('scheduled_start_at')
            ->limit(8)
            ->get();
    }

    protected function heuristicTalkingPoints(Meeting $meeting, $tasks, $actions, $decisions, $questions, $risks): array
    {
        $points = [];

        if ($meeting->objective) {
            $points[] = 'Confirm the objective: '.$meeting->objective;
        }
        if ($meeting->agendaItems->isNotEmpty()) {
            $points[] = 'Walk the agenda ('.$meeting->agendaItems->count().' items) and time-box each topic.';
        }
        if ($tasks->isNotEmpty()) {
            $overdue = $tasks->filter->isOverdue()->count();
            $points[] = $overdue > 0
                ? "Review {$tasks->count()} open tasks ({$overdue} overdue)."
                : "Review {$tasks->count()} open tasks from this project.";
        }
        if ($actions->isNotEmpty()) {
            $points[] = 'Close the loop on '.$actions->count().' carry-over action items from earlier meetings.';
        }
        if ($decisions->isNotEmpty()) {
            $points[] = 'Reconfirm '.$decisions->count().' recent decisions so the team is aligned.';
        }
        if ($questions->isNotEmpty()) {
            $points[] = 'Answer '.$questions->count().' unresolved questions before they block progress.';
        }
        if ($risks->isNotEmpty()) {
            $points[] = 'Surface '.$risks->count().' open risks and assign owners.';
        }
        if ($points === []) {
            $points[] = 'No prior meeting intelligence yet — use this session to set decisions and owners.';
        }

        return $points;
    }

    protected function maybeSynthesize(Meeting $meeting, User $user, array $fallback): array
    {
        $org = $this->context->organization();
        if (! $org?->ai_search_enabled) {
            return ['talking_points' => $fallback, 'summary' => null, 'used_ai' => false];
        }

        $scope = $meeting->project?->name ?: $meeting->title;
        $question = "Prepare a short pre-meeting brief for \"{$meeting->title}\" ({$scope}). "
            .'Give a 2-sentence context recap, then 4-6 talking points grounded only in prior meetings, '
            .'open tasks, unresolved questions, and recent decisions. Do not invent facts.';

        try {
            $result = $this->search->answer($user, $question, $meeting->primary_language ?? 'en');
            $answer = trim((string) ($result['answer'] ?? ''));
            if ($answer === '' || ! ($result['used_context'] ?? false)) {
                return ['talking_points' => $fallback, 'summary' => null, 'used_ai' => false];
            }

            return [
                'talking_points' => $this->pointsFromAnswer($answer, $fallback),
                'summary' => $answer,
                'used_ai' => true,
            ];
        } catch (Throwable) {
            return ['talking_points' => $fallback, 'summary' => null, 'used_ai' => false];
        }
    }

    protected function pointsFromAnswer(string $answer, array $fallback): array
    {
        $lines = preg_split('/\r\n|\r|\n/', $answer) ?: [];
        $points = [];
        foreach ($lines as $line) {
            $clean = trim(preg_replace('/^(\d+[\.\)]\s*|[-*•]\s*)/', '', $line) ?? '');
            if (strlen($clean) >= 12 && strlen($clean) <= 240) {
                $points[] = $clean;
            }
        }

        return $points !== [] ? array_slice($points, 0, 8) : $fallback;
    }
}

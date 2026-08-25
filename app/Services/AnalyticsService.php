<?php

namespace App\Services;

use App\Enums\TaskStatus;
use App\Models\Department;
use App\Models\Meeting;
use App\Models\MeetingDecision;
use App\Models\Task;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Organization-level meeting analytics (spec §36). Deliberately aggregate and
 * descriptive — never per-employee performance scoring (§36/§37). All queries
 * run through the global OrganizationScope, so results are tenant-confined.
 */
class AnalyticsService
{
    public function overview(): array
    {
        return [
            'meetings_per_month' => $this->meetingsPerMonth(),
            'meeting_hours_per_month' => $this->hoursPerMonth(),
            'meetings_by_department' => $this->byDepartment(),
            'action_item_completion' => $this->actionItemCompletion(),
            'decisions_per_month' => $this->decisionsPerMonth(),
            'language_usage' => $this->languageUsage(),
        ];
    }

    /** @return array<int, string> last 12 month keys, oldest first (e.g. "2026-03") */
    protected function monthBuckets(): array
    {
        $months = [];
        $cursor = Carbon::now()->startOfMonth()->subMonths(11);
        for ($i = 0; $i < 12; $i++) {
            $months[] = $cursor->format('Y-m');
            $cursor->addMonth();
        }
        return $months;
    }

    protected function meetingsPerMonth(): array
    {
        $since = Carbon::now()->startOfMonth()->subMonths(11);

        $rows = Meeting::query()
            ->where('scheduled_start_at', '>=', $since)
            ->get(['scheduled_start_at'])
            ->groupBy(fn ($m) => $m->scheduled_start_at->format('Y-m'))
            ->map->count();

        return $this->fillMonths($rows);
    }

    protected function hoursPerMonth(): array
    {
        $since = Carbon::now()->startOfMonth()->subMonths(11);

        $rows = Meeting::query()
            ->where('scheduled_start_at', '>=', $since)
            ->whereNotNull('duration_seconds')
            ->get(['scheduled_start_at', 'duration_seconds'])
            ->groupBy(fn ($m) => $m->scheduled_start_at->format('Y-m'))
            ->map(fn (Collection $g) => round($g->sum('duration_seconds') / 3600, 1));

        return $this->fillMonths($rows);
    }

    protected function decisionsPerMonth(): array
    {
        $since = Carbon::now()->startOfMonth()->subMonths(11);

        $rows = MeetingDecision::query()
            ->whereHas('meeting') // org scope applies through the meeting
            ->where('created_at', '>=', $since)
            ->get(['created_at'])
            ->groupBy(fn ($d) => $d->created_at->format('Y-m'))
            ->map->count();

        return $this->fillMonths($rows);
    }

    protected function byDepartment(): array
    {
        $counts = Meeting::query()
            ->selectRaw('department_id, COUNT(*) as total')
            ->groupBy('department_id')
            ->pluck('total', 'department_id');

        $names = Department::query()->pluck('name', 'id');

        return $counts->map(fn ($total, $id) => [
            'label' => $id ? ($names[$id] ?? 'Unknown') : 'Unassigned',
            'value' => (int) $total,
        ])->values()->all();
    }

    protected function actionItemCompletion(): array
    {
        $completed = Task::query()->where('status', TaskStatus::Completed->value)->count();
        $overdue = Task::query()->overdue()->count();
        $open = Task::query()
            ->whereIn('status', [TaskStatus::Pending->value, TaskStatus::InProgress->value, TaskStatus::Blocked->value])
            ->count();

        return [
            ['label' => 'Completed', 'value' => $completed],
            ['label' => 'Open', 'value' => max(0, $open - $overdue)],
            ['label' => 'Overdue', 'value' => $overdue],
        ];
    }

    protected function languageUsage(): array
    {
        return Meeting::query()
            ->selectRaw('primary_language, COUNT(*) as total')
            ->groupBy('primary_language')
            ->pluck('total', 'primary_language')
            ->map(fn ($total, $lang) => ['label' => $lang ?: 'unknown', 'value' => (int) $total])
            ->values()
            ->all();
    }

    /** Turn a keyed month=>value map into an ordered [{month,value}] series. */
    protected function fillMonths(Collection $rows): array
    {
        return collect($this->monthBuckets())
            ->map(fn ($month) => ['month' => $month, 'value' => $rows->get($month, 0)])
            ->all();
    }
}

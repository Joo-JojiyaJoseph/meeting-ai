<?php

namespace App\Services;

use App\Enums\AiProcessingStatus;
use App\Enums\MeetingStatus;
use App\Enums\TaskStatus;
use App\Models\Meeting;
use App\Models\MeetingDecision;
use App\Models\Task;
use Illuminate\Support\Carbon;

/**
 * Aggregates dashboard statistics (spec §9). All queries run through the global
 * OrganizationScope, so results are automatically confined to the current tenant.
 */
class DashboardService
{
    public function stats(): array
    {
        $today = Carbon::today();

        return [
            'meetings_today' => Meeting::whereDate('scheduled_start_at', $today)
                ->where('status', '!=', MeetingStatus::Cancelled->value)
                ->count(),

            'upcoming_meetings' => Meeting::where('scheduled_start_at', '>', now())
                ->where('status', MeetingStatus::Scheduled->value)
                ->count(),

            'meetings_this_month' => Meeting::whereBetween('scheduled_start_at', [
                $today->copy()->startOfMonth(),
                $today->copy()->endOfMonth(),
            ])->count(),

            'pending_action_items' => Task::whereIn('status', [
                TaskStatus::Pending->value,
                TaskStatus::InProgress->value,
            ])->count(),

            'overdue_action_items' => Task::overdue()->count(),

            'decisions' => MeetingDecision::whereHas('meeting')->count(),

            'ai_processed_meetings' => Meeting::where(
                'ai_processing_status',
                AiProcessingStatus::Completed->value
            )->count(),
        ];
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\MeetingResource;
use App\Models\Meeting;
use App\Models\Task;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index(DashboardService $dashboard): JsonResponse
    {
        $todaysMeetings = Meeting::with(['organizer', 'project'])
            ->whereDate('scheduled_start_at', Carbon::today())
            ->orderBy('scheduled_start_at')
            ->get();

        $pendingTasks = Task::with('assignee')
            ->whereIn('status', [TaskStatus::Pending->value, TaskStatus::InProgress->value])
            ->orderBy('due_date')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => $dashboard->stats(),
            'todays_meetings' => MeetingResource::collection($todaysMeetings),
            'pending_action_items' => $pendingTasks->map(fn ($t) => [
                'id' => $t->ulid,
                'title' => $t->title,
                'assignee' => $t->assignee?->name,
                'due_date' => $t->due_date,
                'priority' => $t->priority,
                'status' => $t->status,
            ]),
        ]);
    }
}

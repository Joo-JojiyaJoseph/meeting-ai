<?php

namespace App\Actions\Tasks;

use App\Enums\ActionItemStatus;
use App\Enums\TaskStatus;
use App\Models\MeetingActionItem;
use App\Models\Task;
use App\Models\User;
use App\Services\Notifications\NotificationService;
use Illuminate\Support\Facades\DB;

/**
 * Turns an AI-suggested action item into a real, tracked task (spec §25, closing
 * Definition-of-Done step 21). The task keeps a link back to its action item,
 * meeting, and transcript timestamp for full traceability; the action item is
 * marked `converted` so it can't be double-accepted.
 */
class ConvertActionItemToTask
{
    /** @param array{title?:string,description?:string,assignee_id?:int|null,due_date?:string|null,priority?:string} $overrides */
    public function handle(MeetingActionItem $item, User $creator, array $overrides = []): Task
    {
        return DB::transaction(function () use ($item, $creator, $overrides) {
            // Idempotent: if a task already originated from this item, return it.
            if ($existing = $item->task()->first()) {
                return $existing;
            }

            $meeting = $item->meeting;

            $task = Task::create([
                'project_id' => $meeting->project_id,
                'meeting_id' => $meeting->id,
                'action_item_id' => $item->id,
                'source_timestamp_ms' => $item->source_timestamp_ms,
                'title' => $overrides['title'] ?? $item->title,
                'description' => $overrides['description'] ?? $item->description,
                'assignee_id' => $overrides['assignee_id'] ?? $item->assignee_user_id,
                'created_by' => $creator->id,
                'priority' => $overrides['priority'] ?? $item->priority->value,
                'due_date' => $overrides['due_date'] ?? $item->due_date,
                'status' => TaskStatus::Pending->value,
            ]);

            // Link is carried by tasks.action_item_id; mark the item converted.
            $item->update([
                'status' => ActionItemStatus::Converted->value,
                'assignee_user_id' => $task->assignee_id,
            ]);

            if ($task->assignee_id && $task->assignee_id !== $creator->id) {
                $assignee = User::find($task->assignee_id);
                if ($assignee) {
                    app(NotificationService::class)->send($assignee, 'task.assigned', [
                        'title' => 'Task assigned',
                        'body' => $task->title,
                        'url' => '/tasks',
                        'meeting_id' => $meeting->ulid,
                    ], $meeting->organization_id);
                }
            }

            return $task;
        });
    }
}

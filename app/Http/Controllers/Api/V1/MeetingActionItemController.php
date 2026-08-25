<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Tasks\ConvertActionItemToTask;
use App\Enums\ActionItemStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ActionItems\AcceptActionItemRequest;
use App\Http\Requests\ActionItems\UpdateActionItemRequest;
use App\Http\Resources\TaskResource;
use App\Models\Meeting;
use App\Models\MeetingActionItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;

/**
 * Managing AI-suggested action items before/while turning them into tasks (§25).
 * Authorized through the meeting: `manageParticipants`-style organizer powers via
 * MeetingPolicy plus the `action_items.manage` permission.
 */
class MeetingActionItemController extends Controller
{
    public function update(UpdateActionItemRequest $request, Meeting $meeting, string $actionItem): JsonResponse
    {
        $this->authorizeManage($meeting);
        $item = $this->resolve($meeting, $actionItem);

        $data = $request->validated();
        if (array_key_exists('assignee_id', $data)) {
            $data['assignee_user_id'] = $this->resolveUser($data['assignee_id']);
            unset($data['assignee_id']);
        }
        $item->update($data);

        return response()->json(['message' => 'Action item updated.']);
    }

    public function accept(AcceptActionItemRequest $request, Meeting $meeting, string $actionItem, ConvertActionItemToTask $convert): JsonResponse
    {
        $this->authorizeManage($meeting);
        $item = $this->resolve($meeting, $actionItem);

        $overrides = $request->validated();
        if (array_key_exists('assignee_id', $overrides)) {
            $overrides['assignee_id'] = $this->resolveUser($overrides['assignee_id']);
        }

        $task = $convert->handle($item, $request->user(), $overrides);

        return (new TaskResource($task->load('assignee')))
            ->additional(['message' => 'Action item converted to task.'])
            ->response()
            ->setStatusCode(201);
    }

    public function reject(Meeting $meeting, string $actionItem): JsonResponse
    {
        $this->authorizeManage($meeting);
        $item = $this->resolve($meeting, $actionItem);
        $item->update(['status' => ActionItemStatus::Rejected->value]);

        return response()->json(['message' => 'Action item rejected.']);
    }

    protected function authorizeManage(Meeting $meeting): void
    {
        // Organizer, or a user with action_items.manage, may manage these.
        abort_unless(
            $meeting->organizer_id === request()->user()->id
                || request()->user()->hasPermission('action_items.manage'),
            403,
        );
    }

    protected function resolve(Meeting $meeting, string $ulid): MeetingActionItem
    {
        return $meeting->actionItems()->where('ulid', $ulid)->firstOrFail();
    }

    protected function resolveUser(?string $ulid): ?int
    {
        return $ulid ? User::where('ulid', $ulid)->value('id') : null;
    }
}

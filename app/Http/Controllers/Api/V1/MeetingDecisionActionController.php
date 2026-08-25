<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\DecisionStatus;
use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\MeetingDecision;
use Illuminate\Http\JsonResponse;

/**
 * Approve/reject AI-proposed decisions on a meeting (mirrors the action-item
 * accept/reject flow in MeetingActionItemController). Authorized via
 * MeetingDecisionPolicy::manage: the meeting organizer, or anyone holding
 * decisions.manage.
 */
class MeetingDecisionActionController extends Controller
{
    public function approve(Meeting $meeting, string $decision): JsonResponse
    {
        $item = $this->resolve($meeting, $decision);
        $this->authorize('manage', $item);

        $item->update([
            'status' => DecisionStatus::Approved->value,
            'decided_by' => request()->user()->id,
        ]);

        return response()->json(['message' => 'Decision approved.']);
    }

    public function reject(Meeting $meeting, string $decision): JsonResponse
    {
        $item = $this->resolve($meeting, $decision);
        $this->authorize('manage', $item);

        $item->update([
            'status' => DecisionStatus::Rejected->value,
            'decided_by' => request()->user()->id,
        ]);

        return response()->json(['message' => 'Decision rejected.']);
    }

    protected function resolve(Meeting $meeting, string $ulid): MeetingDecision
    {
        return $meeting->decisions()->where('ulid', $ulid)->firstOrFail();
    }
}

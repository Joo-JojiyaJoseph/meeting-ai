<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Participants\StoreParticipantRequest;
use App\Http\Resources\ParticipantResource;
use App\Models\Meeting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MeetingParticipantController extends Controller
{
    public function index(Meeting $meeting): AnonymousResourceCollection
    {
        $this->authorize('view', $meeting);

        return ParticipantResource::collection($meeting->participants()->with('user')->get());
    }

    public function store(StoreParticipantRequest $request, Meeting $meeting): JsonResponse
    {
        $this->authorize('manageParticipants', $meeting);

        $userId = $request->filled('user_id')
            ? User::where('ulid', $request->user_id)->value('id')
            : null;

        $participant = $meeting->participants()->create([
            'user_id' => $userId,
            'guest_name' => $userId ? null : $request->name,
            'guest_email' => $userId ? null : $request->email,
            'role_in_meeting' => $request->input('role_in_meeting', 'attendee'),
        ]);

        return (new ParticipantResource($participant->load('user')))->response()->setStatusCode(201);
    }

    public function destroy(Meeting $meeting, int $participant): JsonResponse
    {
        $this->authorize('manageParticipants', $meeting);

        // Scope the lookup to this meeting so ids can't leak across meetings.
        $meeting->participants()->whereKey($participant)->firstOrFail()->delete();

        return response()->json(['message' => 'Participant removed.']);
    }

    /** Guests currently waiting to be let in after requesting to join via share link. */
    public function joinRequests(Meeting $meeting): AnonymousResourceCollection
    {
        $this->authorize('manageParticipants', $meeting);

        return ParticipantResource::collection(
            $meeting->pendingJoinRequests()->orderBy('join_requested_at')->get()
        );
    }

    public function approve(Meeting $meeting, int $participant): JsonResponse
    {
        $this->authorize('manageParticipants', $meeting);

        $row = $meeting->participants()->whereKey($participant)->firstOrFail();
        $row->update(['join_status' => 'approved']);

        return (new ParticipantResource($row))->response();
    }

    public function deny(Meeting $meeting, int $participant): JsonResponse
    {
        $this->authorize('manageParticipants', $meeting);

        $row = $meeting->participants()->whereKey($participant)->firstOrFail();
        $row->update(['join_status' => 'denied']);

        return (new ParticipantResource($row))->response();
    }
}

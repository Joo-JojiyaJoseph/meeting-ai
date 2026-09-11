<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Participants\RequestJoinRequest;
use App\Http\Resources\PublicMeetingResource;
use App\Models\Meeting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Unauthenticated endpoints behind a meeting's share code (spec: "share via
 * WhatsApp or copy code, host approves before they're let in"). None of these
 * routes carry auth:sanctum — the share code itself is the credential, and it
 * only ever grants a *pending* waiting-room seat, never direct meeting access.
 */
class MeetingJoinController extends Controller
{
    /** Public landing info so the participant can confirm this is the right meeting. */
    public function show(Meeting $meeting): PublicMeetingResource
    {
        return new PublicMeetingResource($meeting->load('organizer'));
    }

    /** Submit a request to join. Always lands in the waiting room, never auto-approved. */
    public function store(RequestJoinRequest $request, Meeting $meeting): JsonResponse
    {
        if (in_array($meeting->status->value, ['cancelled', 'completed'], true)) {
            throw ValidationException::withMessages([
                'meeting' => 'This meeting is not accepting join requests.',
            ]);
        }

        $participant = $meeting->participants()->create([
            'guest_name' => $request->name,
            'guest_email' => $request->email,
            'role_in_meeting' => 'attendee',
            'join_status' => 'pending',
            'join_requested_at' => now(),
            'request_token' => (string) Str::uuid(),
        ]);

        return response()->json([
            'request_token' => $participant->request_token,
            'join_status' => $participant->join_status,
        ], 201);
    }

    /** The participant polls this (e.g. every few seconds) while waiting to be let in. */
    public function status(Request $request, Meeting $meeting, string $requestToken): JsonResponse
    {
        $participant = $meeting->participants()
            ->where('request_token', $requestToken)
            ->firstOrFail();

        return response()->json([
            'join_status' => $participant->join_status,
            'meet_url' => $participant->join_status === 'approved' ? $meeting->meet_url : null,
        ]);
    }
}

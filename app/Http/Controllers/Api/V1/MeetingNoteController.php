<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notes\StoreMeetingNoteRequest;
use App\Http\Requests\Notes\UpdateMeetingNoteRequest;
use App\Http\Resources\MeetingNoteResource;
use App\Models\Meeting;
use App\Models\MeetingNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Lightweight manual notes, independent of the AI pipeline (spec: "in-meeting
 * note-taking"). Reuses MeetingPolicy::view for read/create access — the same
 * gate transcripts/decisions/etc. already use — so nothing new is introduced
 * to the authorization model. Never touched by AI processing or Meet
 * artifact polling.
 */
class MeetingNoteController extends Controller
{
    public function index(Meeting $meeting): AnonymousResourceCollection
    {
        $this->authorize('view', $meeting);

        return MeetingNoteResource::collection(
            $meeting->notes()->with('user')->get()
        );
    }

    public function store(StoreMeetingNoteRequest $request, Meeting $meeting): JsonResponse
    {
        $this->authorize('view', $meeting);

        $note = $meeting->notes()->create([
            'user_id' => $request->user()->id,
            'content' => $request->validated('content'),
        ]);
        $note->setRelation('user', $request->user());

        return (new MeetingNoteResource($note))->response()->setStatusCode(201);
    }

    public function update(UpdateMeetingNoteRequest $request, Meeting $meeting, string $note): JsonResponse
    {
        $this->authorize('view', $meeting);
        $row = $this->resolve($meeting, $note);
        $this->authorizeOwner($row, $meeting);

        $row->update(['content' => $request->validated('content')]);

        return (new MeetingNoteResource($row->load('user')))->response();
    }

    public function destroy(Meeting $meeting, string $note): JsonResponse
    {
        $this->authorize('view', $meeting);
        $row = $this->resolve($meeting, $note);
        $this->authorizeOwner($row, $meeting);

        $row->delete();

        return response()->json(['message' => 'Note deleted.']);
    }

    protected function resolve(Meeting $meeting, string $ulid): MeetingNote
    {
        return $meeting->notes()->where('ulid', $ulid)->firstOrFail();
    }

    /** Only the note's author, or the meeting organizer, may edit/delete it. */
    protected function authorizeOwner(MeetingNote $note, Meeting $meeting): void
    {
        $userId = request()->user()->id;
        abort_unless(
            $note->user_id === $userId || $meeting->organizer_id === $userId,
            403,
            'You can only edit or delete your own notes.',
        );
    }
}

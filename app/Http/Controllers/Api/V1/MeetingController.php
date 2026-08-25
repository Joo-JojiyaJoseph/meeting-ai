<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Meetings\CreateMeeting;
use App\Enums\MeetingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Meetings\StoreMeetingRequest;
use App\Http\Requests\Meetings\UpdateMeetingRequest;
use App\Http\Resources\MeetingResource;
use App\Jobs\Google\CancelGoogleEvent;
use App\Jobs\Google\UpdateGoogleEvent;
use App\Models\Meeting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MeetingController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Meeting::class);

        $meetings = Meeting::query()
            ->with(['organizer', 'project'])
            ->withCount('participants')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('language'), fn ($q) => $q->where('primary_language', $request->language))
            ->when($request->filled('project_id'), fn ($q) => $q->whereHas('project', fn ($p) => $p->where('ulid', $request->project_id)))
            ->when($request->filled('department_id'), fn ($q) => $q->whereHas('department', fn ($d) => $d->where('ulid', $request->department_id)))
            ->when($request->filled('organizer_id'), fn ($q) => $q->whereHas('organizer', fn ($o) => $o->where('ulid', $request->organizer_id)))
            ->when($request->filled('participant_id'), fn ($q) => $q->whereHas('participants.user', fn ($u) => $u->where('ulid', $request->participant_id)))
            ->when($request->filled('from'), fn ($q) => $q->where('scheduled_start_at', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($q) => $q->where('scheduled_start_at', '<=', $request->date('to')))
            ->when($request->filled('q'), fn ($q) => $q->where(function ($sub) use ($request) {
                $term = $request->string('q');
                $sub->where('title', 'like', "%{$term}%")
                    ->orWhereHas('project', fn ($p) => $p->where('name', 'like', "%{$term}%"))
                    ->orWhereHas('participants', fn ($pt) => $pt
                        ->where('guest_name', 'like', "%{$term}%")
                        ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%")));
            }))
            ->orderByDesc('scheduled_start_at')
            ->paginate(20)
            ->withQueryString();

        return MeetingResource::collection($meetings);
    }

    public function store(StoreMeetingRequest $request, CreateMeeting $action): JsonResponse
    {
        $this->authorize('create', Meeting::class);

        $meeting = $action->handle($request->user(), $request->validated());

        return (new MeetingResource($meeting))->response()->setStatusCode(201);
    }

    public function show(Meeting $meeting): MeetingResource
    {
        $this->authorize('view', $meeting);

        return new MeetingResource(
            $meeting->load(['organizer', 'project', 'department', 'participants.user', 'agendaItems'])
                ->loadCount(['participants', 'actionItems', 'decisions'])
        );
    }

    public function update(UpdateMeetingRequest $request, Meeting $meeting): MeetingResource
    {
        $this->authorize('update', $meeting);

        $meeting->update($request->validated());

        // Keep the linked calendar event in sync if scheduling/title changed.
        if ($meeting->google_event_id && $meeting->wasChanged(['title', 'description', 'scheduled_start_at', 'scheduled_end_at'])) {
            UpdateGoogleEvent::dispatch($meeting->id);
        }

        return new MeetingResource($meeting);
    }

    public function cancel(Meeting $meeting): JsonResponse
    {
        $this->authorize('update', $meeting);

        $meeting->update(['status' => MeetingStatus::Cancelled]);

        if ($meeting->google_event_id) {
            CancelGoogleEvent::dispatch($meeting->id, $meeting->google_event_id);
        }

        return response()->json(['message' => 'Meeting cancelled.']);
    }

    public function destroy(Meeting $meeting): JsonResponse
    {
        $this->authorize('delete', $meeting);
        $meeting->delete();

        return response()->json(['message' => 'Meeting deleted.']);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agenda\ReorderAgendaRequest;
use App\Http\Requests\Agenda\StoreAgendaRequest;
use App\Http\Requests\Agenda\UpdateAgendaRequest;
use App\Http\Resources\AgendaResource;
use App\Models\Meeting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MeetingAgendaController extends Controller
{
    public function index(Meeting $meeting): AnonymousResourceCollection
    {
        $this->authorize('view', $meeting);

        return AgendaResource::collection($meeting->agendaItems);
    }

    public function store(StoreAgendaRequest $request, Meeting $meeting): JsonResponse
    {
        $this->authorize('update', $meeting);

        $position = (int) $meeting->agendaItems()->max('position') + 1;

        $item = $meeting->agendaItems()->create([
            'position' => $position,
            'title' => $request->title,
            'description' => $request->description,
            'duration_minutes' => $request->duration_minutes,
        ]);

        return (new AgendaResource($item))->response()->setStatusCode(201);
    }

    public function update(UpdateAgendaRequest $request, Meeting $meeting, int $agenda): AgendaResource
    {
        $this->authorize('update', $meeting);

        $item = $meeting->agendaItems()->whereKey($agenda)->firstOrFail();
        $item->update($request->validated());

        return new AgendaResource($item);
    }

    public function destroy(Meeting $meeting, int $agenda): JsonResponse
    {
        $this->authorize('update', $meeting);

        $meeting->agendaItems()->whereKey($agenda)->firstOrFail()->delete();

        return response()->json(['message' => 'Agenda item deleted.']);
    }

    /** Accepts an ordered array of agenda item ids and rewrites positions. */
    public function reorder(ReorderAgendaRequest $request, Meeting $meeting): AnonymousResourceCollection
    {
        $this->authorize('update', $meeting);

        $validIds = $meeting->agendaItems()->pluck('id')->all();

        foreach ($request->order as $position => $id) {
            if (in_array($id, $validIds, true)) {
                $meeting->agendaItems()->whereKey($id)->update(['position' => $position]);
            }
        }

        return AgendaResource::collection($meeting->agendaItems()->get());
    }
}

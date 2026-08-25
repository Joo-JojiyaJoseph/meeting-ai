<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\DecisionResource;
use App\Models\Meeting;
use App\Models\MeetingDecision;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Organization-wide decision log. MeetingDecision has no organization_id of
 * its own — it's scoped through its meeting, so whereHas('meeting') is what
 * pulls in Meeting's tenant global scope (spec §31 area, decisions log).
 */
class DecisionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', MeetingDecision::class);

        $decisions = MeetingDecision::query()
            ->whereHas('meeting')
            ->with(['meeting:id,ulid,title,scheduled_start_at', 'project:id,ulid,name'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('project_id'), function ($q) use ($request) {
                $q->whereHas('project', fn ($p) => $p->where('ulid', $request->project_id));
            })
            ->latest()
            ->paginate(20);

        return DecisionResource::collection($decisions);
    }
}

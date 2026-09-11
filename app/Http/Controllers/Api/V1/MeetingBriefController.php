<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Services\Meetings\MeetingBriefService;
use Illuminate\Http\JsonResponse;

class MeetingBriefController extends Controller
{
    public function show(Meeting $meeting, MeetingBriefService $briefs): JsonResponse
    {
        $this->authorize('view', $meeting);

        $meeting->load(['project', 'agendaItems']);

        return response()->json($briefs->build($meeting, request()->user()));
    }
}

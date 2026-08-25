<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Meetings\ProcessMeeting;
use App\Enums\AiProcessingStatus;
use App\Http\Controllers\Controller;
use App\Models\Meeting;
use Illuminate\Http\JsonResponse;

class MeetingProcessingController extends Controller
{
    /** (Re)trigger the AI pipeline for a meeting. */
    public function store(Meeting $meeting, ProcessMeeting $action): JsonResponse
    {
        $this->authorize('update', $meeting);

        $action->handle($meeting);

        return response()->json([
            'message' => 'Processing started.',
            'status' => $meeting->fresh()->ai_processing_status,
        ]);
    }

    /** Live pipeline status for the processing UI (§22, §58). */
    public function show(Meeting $meeting): JsonResponse
    {
        $this->authorize('view', $meeting);

        $status = $meeting->ai_processing_status;

        return response()->json([
            'status' => $status,
            'label' => $status instanceof AiProcessingStatus ? $status->label() : (string) $status,
            'is_terminal' => $status instanceof AiProcessingStatus ? $status->isTerminal() : false,
            'stages' => [
                'transcript' => $meeting->transcript()->exists(),
                'summary' => $meeting->summary()->exists(),
                'decisions' => $meeting->decisions()->exists(),
                'action_items' => $meeting->actionItems()->exists(),
                'mom' => $meeting->minutes()->exists(),
                'indexed' => $meeting->segments()->exists(),
            ],
        ]);
    }
}

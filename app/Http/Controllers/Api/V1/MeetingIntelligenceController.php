<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActionItemResource;
use App\Http\Resources\DecisionResource;
use App\Http\Resources\MomResource;
use App\Http\Resources\QuestionResource;
use App\Http\Resources\RiskResource;
use App\Http\Resources\SpeakerResource;
use App\Http\Resources\SummaryResource;
use App\Http\Resources\TopicResource;
use App\Http\Resources\TranscriptSegmentResource;
use App\Models\Meeting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Read endpoints for everything the AI pipeline produced. All authorize through
 * the MeetingPolicy, so the visibility tiers and grounding apply automatically.
 */
class MeetingIntelligenceController extends Controller
{
    public function transcript(Meeting $meeting): AnonymousResourceCollection
    {
        $this->authorize('viewTranscript', $meeting);

        $segments = $meeting->segments()
            ->with('speaker.user')
            ->orderBy('start_ms')
            ->paginate(150);

        return TranscriptSegmentResource::collection($segments)->additional([
            'speakers' => SpeakerResource::collection($meeting->speakers()->with('user')->get()),
            'transcript' => [
                'primary_language' => $meeting->transcript?->primary_language,
                'detected_languages' => $meeting->transcript?->detected_languages ?? [],
                'word_count' => $meeting->transcript?->word_count,
            ],
        ]);
    }

    /** Summary tab bundles summary + topics + risks + open questions (§23). */
    public function summary(Meeting $meeting): JsonResponse
    {
        $this->authorize('view', $meeting);

        return response()->json([
            'summary' => $meeting->summary ? new SummaryResource($meeting->summary) : null,
            'topics' => TopicResource::collection($meeting->topics()->orderBy('position')->get()),
            'risks' => RiskResource::collection($meeting->risks()->get()),
            'questions' => QuestionResource::collection($meeting->questions()->get()),
        ]);
    }

    public function decisions(Meeting $meeting): AnonymousResourceCollection
    {
        $this->authorize('view', $meeting);

        return DecisionResource::collection(
            $meeting->decisions()->orderBy('source_timestamp_ms')->get()
        );
    }

    public function actionItems(Meeting $meeting): AnonymousResourceCollection
    {
        $this->authorize('view', $meeting);

        return ActionItemResource::collection(
            $meeting->actionItems()->with('assignee')->orderByDesc('priority')->get()
        );
    }

    public function mom(Meeting $meeting): JsonResponse
    {
        $this->authorize('view', $meeting);

        return response()->json([
            'data' => $meeting->minutes ? new MomResource($meeting->minutes) : null,
        ]);
    }
}

<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Jobs\Concerns\BuildsAnalysisContext;
use App\Models\Meeting;
use App\Models\MinutesOfMeeting;
use App\Services\AI\AiClient;
use Illuminate\Support\Facades\DB;

/** Generates the MoM as an AI draft; the organizer reviews/approves later (§28). */
class GenerateMomJob extends PipelineJob
{
    use BuildsAnalysisContext;

    protected function status(): AiProcessingStatus
    {
        return AiProcessingStatus::GeneratingMom;
    }

    protected function process(Meeting $meeting, AiClient $ai): void
    {
        $result = $ai->minutes($this->analysisContext($meeting));
        $minutesData = $result['minutes'] ?? [];

        DB::transaction(function () use ($meeting, $result, $minutesData) {
            $mom = MinutesOfMeeting::updateOrCreate(
                ['meeting_id' => $meeting->id],
                [
                    'title' => $minutesData['title'] ?? $meeting->title,
                    'content' => $minutesData,
                    'status' => 'ai_generated',
                    'language' => $result['language'] ?? $meeting->primary_language,
                    'generated_by_ai' => true,
                    'current_version' => 1,
                ],
            );

            // Snapshot v1 so the editor has a baseline to diff/rollback against.
            $mom->versions()->updateOrCreate(
                ['version' => 1],
                ['content' => $minutesData],
            );
        });
    }
}

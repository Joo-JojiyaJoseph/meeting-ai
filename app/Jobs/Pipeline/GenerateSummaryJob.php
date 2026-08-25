<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Jobs\Concerns\BuildsAnalysisContext;
use App\Models\Meeting;
use App\Models\MeetingSummary;
use App\Services\AI\AiClient;

class GenerateSummaryJob extends PipelineJob
{
    use BuildsAnalysisContext;

    protected function status(): AiProcessingStatus
    {
        return AiProcessingStatus::GeneratingSummary;
    }

    protected function process(Meeting $meeting, AiClient $ai): void
    {
        $result = $ai->summary($this->analysisContext($meeting));

        MeetingSummary::updateOrCreate(
            ['meeting_id' => $meeting->id],
            [
                'executive_summary' => implode("\n", $result['executive_summary'] ?? []),
                'detailed_summary' => $result['detailed_summary'] ?? null,
                'key_points' => $result['key_points'] ?? [],
                'next_steps' => $result['next_steps'] ?? [],
                'language' => $result['language'] ?? $meeting->primary_language,
                'model' => $result['provider'] ?? null,
                'generated_at' => now(),
            ],
        );
    }
}

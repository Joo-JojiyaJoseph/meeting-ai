<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Jobs\Concerns\BuildsAnalysisContext;
use App\Models\Meeting;
use App\Services\AI\AiClient;

class ExtractTopicsJob extends PipelineJob
{
    use BuildsAnalysisContext;

    protected function status(): AiProcessingStatus
    {
        return AiProcessingStatus::Analyzing;
    }

    protected function process(Meeting $meeting, AiClient $ai): void
    {
        $result = $ai->topics($this->analysisContext($meeting));

        $meeting->topics()->delete();
        foreach (array_values($result['topics'] ?? []) as $i => $topic) {
            $meeting->topics()->create([
                'title' => $topic['title'],
                'description' => $topic['description'] ?? null,
                'position' => $i,
                'start_ms' => $topic['start_ms'] ?? null,
                'end_ms' => $topic['end_ms'] ?? null,
            ]);
        }
    }
}

<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Jobs\Concerns\BuildsAnalysisContext;
use App\Models\Meeting;
use App\Services\AI\AiClient;

/** Persists grounded decisions (source timestamp + confidence preserved, §53). */
class ExtractDecisionsJob extends PipelineJob
{
    use BuildsAnalysisContext;

    protected function status(): AiProcessingStatus
    {
        return AiProcessingStatus::Analyzing;
    }

    protected function process(Meeting $meeting, AiClient $ai): void
    {
        $result = $ai->decisions($this->analysisContext($meeting));

        // Clear prior AI-generated decisions; keep human-confirmed ones.
        $meeting->decisions()->where('created_by_ai', true)->where('status', 'proposed')->delete();

        foreach ($result['decisions'] ?? [] as $d) {
            $meeting->decisions()->create([
                'project_id' => $meeting->project_id,
                'topic' => $d['topic'] ?? null,
                'decision' => $d['decision'],
                'context' => $d['context'] ?? null,
                'source_timestamp_ms' => $d['source_timestamp_ms'] ?? null,
                'ai_confidence' => $d['confidence'] ?? 'medium',
                'created_by_ai' => true,
                'status' => 'proposed',
            ]);
        }
    }
}

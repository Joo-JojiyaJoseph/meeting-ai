<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Jobs\Concerns\BuildsAnalysisContext;
use App\Models\Meeting;
use App\Services\AI\AiClient;

class ExtractRisksQuestionsJob extends PipelineJob
{
    use BuildsAnalysisContext;

    protected function status(): AiProcessingStatus
    {
        return AiProcessingStatus::Analyzing;
    }

    protected function process(Meeting $meeting, AiClient $ai): void
    {
        $result = $ai->risksQuestions($this->analysisContext($meeting));

        $meeting->risks()->delete();
        foreach ($result['risks'] ?? [] as $r) {
            $meeting->risks()->create([
                'title' => $r['title'],
                'description' => $r['description'] ?? null,
                'severity' => $r['severity'] ?? 'medium',
                'mitigation' => $r['mitigation'] ?? null,
                'source_timestamp_ms' => $r['source_timestamp_ms'] ?? null,
                'ai_confidence' => $r['confidence'] ?? 'medium',
                'status' => 'open',
            ]);
        }

        $meeting->questions()->delete();
        foreach ($result['questions'] ?? [] as $q) {
            $meeting->questions()->create([
                'question' => $q['question'],
                'context' => $q['context'] ?? null,
                'source_timestamp_ms' => $q['source_timestamp_ms'] ?? null,
                'ai_confidence' => $q['confidence'] ?? 'medium',
                'is_resolved' => false,
            ]);
        }
    }
}

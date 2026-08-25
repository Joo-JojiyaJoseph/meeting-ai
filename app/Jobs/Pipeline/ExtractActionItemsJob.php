<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Jobs\Concerns\BuildsAnalysisContext;
use App\Models\Meeting;
use App\Services\AI\AiClient;

/** Action items land as `suggested` for manager review before becoming tasks (§25). */
class ExtractActionItemsJob extends PipelineJob
{
    use BuildsAnalysisContext;

    protected function status(): AiProcessingStatus
    {
        return AiProcessingStatus::ExtractingActions;
    }

    protected function process(Meeting $meeting, AiClient $ai): void
    {
        $result = $ai->actionItems($this->analysisContext($meeting));

        $meeting->actionItems()->where('created_by_ai', true)->where('status', 'suggested')->delete();

        foreach ($result['action_items'] ?? [] as $item) {
            $meeting->actionItems()->create([
                'title' => $item['title'],
                'description' => $item['description'] ?? null,
                'assignee_name_raw' => $item['assignee_name_raw'] ?? null,
                'due_date' => $item['due_date'] ?? null,
                'due_date_confidence' => $item['due_date_confidence'] ?? null,
                'priority' => $item['priority'] ?? 'medium',
                'source_timestamp_ms' => $item['source_timestamp_ms'] ?? null,
                'ai_confidence' => $item['confidence'] ?? 'medium',
                'created_by_ai' => true,
                'status' => 'suggested',
            ]);
        }
    }
}

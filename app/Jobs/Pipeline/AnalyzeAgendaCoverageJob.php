<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Jobs\Concerns\BuildsAnalysisContext;
use App\Models\Meeting;
use App\Services\AI\AiClient;

/** Marks which agenda items were actually discussed (§16). */
class AnalyzeAgendaCoverageJob extends PipelineJob
{
    use BuildsAnalysisContext;

    protected function status(): AiProcessingStatus
    {
        return AiProcessingStatus::Analyzing;
    }

    protected function process(Meeting $meeting, AiClient $ai): void
    {
        $result = $ai->agendaCoverage($this->analysisContext($meeting));

        $byTitle = collect($result['items'] ?? [])->keyBy('agenda_title');

        foreach ($meeting->agendaItems as $item) {
            if ($match = $byTitle->get($item->title)) {
                $item->update([
                    'discussed_status' => $match['discussed_status'],
                    'ai_confidence' => $match['confidence'] ?? 'medium',
                    'is_completed' => ($match['discussed_status'] ?? null) === 'discussed',
                ]);
            }
        }
    }
}

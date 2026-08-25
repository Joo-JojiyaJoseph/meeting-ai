<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Models\Meeting;
use App\Services\AI\AiClient;

class FinalizeMeetingJob extends PipelineJob
{
    protected function status(): AiProcessingStatus
    {
        return AiProcessingStatus::Completed;
    }

    protected function process(Meeting $meeting, AiClient $ai): void
    {
        // Terminal stage. A MeetingProcessed notification would fire here (§38).
    }
}

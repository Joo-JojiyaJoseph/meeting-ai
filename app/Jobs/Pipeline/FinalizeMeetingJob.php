<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Models\Meeting;
use App\Services\AI\AiClient;
use App\Services\Notifications\NotificationService;

class FinalizeMeetingJob extends PipelineJob
{
    protected function status(): AiProcessingStatus
    {
        return AiProcessingStatus::Completed;
    }

    protected function process(Meeting $meeting, AiClient $ai): void
    {
        app(NotificationService::class)->notifyMeetingParticipants($meeting, 'meeting.processed', [
            'title' => 'AI insights ready',
            'body' => 'MeetingAI finished processing '.$meeting->title.'.',
            'url' => '/meetings/'.$meeting->ulid,
            'meeting_id' => $meeting->ulid,
        ]);
    }
}

<?php

namespace App\Listeners;

use App\Actions\Meetings\ProcessMeeting;
use App\Events\MeetingArtifactReady;

class StartMeetingProcessing
{
    public function __construct(protected ProcessMeeting $processMeeting) {}

    public function handle(MeetingArtifactReady $event): void
    {
        $this->processMeeting->handle($event->meeting);
    }
}

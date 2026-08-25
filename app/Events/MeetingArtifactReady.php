<?php

namespace App\Events;

use App\Models\Meeting;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/** Fired when a recording/transcript artifact is available for processing. */
class MeetingArtifactReady
{
    use Dispatchable, SerializesModels;

    public function __construct(public Meeting $meeting) {}
}

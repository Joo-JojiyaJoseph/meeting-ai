<?php

use App\Console\Commands\PollMeetingArtifacts;
use Illuminate\Support\Facades\Schedule;

// Poll for Meet recordings/transcripts every 15 minutes.
Schedule::command(PollMeetingArtifacts::class)->everyFifteenMinutes()->withoutOverlapping();

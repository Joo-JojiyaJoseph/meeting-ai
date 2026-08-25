<?php

namespace App\Console\Commands;

use App\Enums\AiProcessingStatus;
use App\Enums\MeetingStatus;
use App\Jobs\Google\SyncMeetingArtifacts;
use App\Models\Meeting;
use Illuminate\Console\Command;

/**
 * Finds recently-ended meetings that have a Meet conference but no artifact yet,
 * and dispatches a sync. Scheduled every 15 minutes (see routes/console.php).
 * Recordings can take a while to appear in Drive, so we keep looking for a day.
 */
class PollMeetingArtifacts extends Command
{
    protected $signature = 'meetings:poll-artifacts';
    protected $description = 'Discover Google Meet recordings/transcripts for finished meetings';

    public function handle(): int
    {
        $meetings = Meeting::withoutGlobalScopes()
            ->whereNotNull('google_meet_id')
            ->where('status', '!=', MeetingStatus::Cancelled->value)
            ->where('ai_processing_status', AiProcessingStatus::Pending->value)
            ->where('scheduled_end_at', '<', now())
            ->where('scheduled_end_at', '>', now()->subDay())
            ->limit(100)
            ->get();

        foreach ($meetings as $meeting) {
            SyncMeetingArtifacts::dispatch($meeting->id);
        }

        $this->info("Dispatched artifact sync for {$meetings->count()} meeting(s).");

        return self::SUCCESS;
    }
}

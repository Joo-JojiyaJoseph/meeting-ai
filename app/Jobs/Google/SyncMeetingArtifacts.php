<?php

namespace App\Jobs\Google;

use App\Events\MeetingArtifactReady;
use App\Models\Meeting;
use App\Services\Google\GoogleMeetArtifactService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Discovers Meet recordings/transcripts for a finished meeting, registers them
 * as artifacts, and kicks off the AI pipeline. See GoogleMeetArtifactService for
 * the Workspace/API requirements — the manual-upload path is the fallback.
 */
class SyncMeetingArtifacts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, ResolvesGoogleContext, SerializesModels;

    public int $tries = 3;

    public function __construct(public int $meetingId) {}

    public function handle(GoogleMeetArtifactService $artifacts): void
    {
        $this->withMeeting($this->meetingId, function (Meeting $meeting) use ($artifacts) {
            $account = $this->googleAccountFor($meeting);
            if (! $account) {
                return;
            }

            $discovered = $artifacts->discover($account, $meeting);
            if (empty($discovered)) {
                return;
            }

            foreach ($discovered as $item) {
                $meeting->artifacts()->firstOrCreate(
                    ['google_file_id' => $item['google_file_id']],
                    [
                        'type' => $item['type'],
                        'source' => 'google_meet',
                        'drive_url' => $item['drive_url'] ?? null,
                        'status' => 'available',
                    ],
                );
            }

            event(new MeetingArtifactReady($meeting));
        });
    }
}

<?php

namespace App\Jobs\Google;

use App\Models\Meeting;
use App\Services\Google\GoogleCalendarService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/** Creates the Calendar event + Meet link and stores the ids on the meeting. */
class ScheduleGoogleEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, ResolvesGoogleContext, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public int $meetingId) {}

    public function handle(GoogleCalendarService $calendar): void
    {
        $this->withMeeting($this->meetingId, function (Meeting $meeting) use ($calendar) {
            $account = $this->googleAccountFor($meeting);

            if (! $account) {
                Log::warning('ScheduleGoogleEvent: organizer has no active Google account', [
                    'meeting_id' => $meeting->id,
                ]);
                return;
            }

            $ids = $calendar->createEventWithMeet($account, $meeting);
            $meeting->update($ids);
        });
    }
}

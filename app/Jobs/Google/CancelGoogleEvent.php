<?php

namespace App\Jobs\Google;

use App\Models\Meeting;
use App\Services\Google\GoogleCalendarService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CancelGoogleEvent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, ResolvesGoogleContext, SerializesModels;

    public function __construct(public int $meetingId, public string $eventId) {}

    public function handle(GoogleCalendarService $calendar): void
    {
        $this->withMeeting($this->meetingId, function (Meeting $meeting) use ($calendar) {
            if ($account = $this->googleAccountFor($meeting)) {
                $calendar->deleteEvent($account, $this->eventId);
            }
        });
    }
}

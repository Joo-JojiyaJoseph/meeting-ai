<?php

namespace App\Services\Google;

use App\Models\GoogleAccount;
use App\Models\Meeting;
use Google\Service\Calendar as CalendarService;
use Google\Service\Calendar\ConferenceData;
use Google\Service\Calendar\CreateConferenceRequest;
use Google\Service\Calendar\Event;
use Google\Service\Calendar\EventAttendee;
use Google\Service\Calendar\EventDateTime;
use Illuminate\Support\Str;

/**
 * Wraps Google Calendar for meeting scheduling with an attached Google Meet
 * conference (spec §12). This is the well-documented, stable part of the Google
 * integration. Uses the organizer's primary calendar.
 */
class GoogleCalendarService
{
    public function __construct(protected GoogleClientFactory $factory) {}

    protected function service(GoogleAccount $account): CalendarService
    {
        return new CalendarService($this->factory->forAccount($account));
    }

    /**
     * Create a calendar event with a Meet link. Returns the Google identifiers
     * to persist on the meeting.
     */
    public function createEventWithMeet(GoogleAccount $account, Meeting $meeting): array
    {
        $service = $this->service($account);

        $event = new Event([
            'summary' => $meeting->title,
            'description' => $meeting->description,
            'start' => $this->dateTime($meeting->scheduled_start_at, $meeting->timezone),
            'end' => $this->dateTime($meeting->scheduled_end_at, $meeting->timezone),
            'attendees' => $this->attendees($meeting),
        ]);

        // Request Meet conference creation.
        $conference = new ConferenceData();
        $request = new CreateConferenceRequest();
        $request->setRequestId((string) Str::uuid());
        $request->setConferenceSolutionKey(['type' => 'hangoutsMeet']);
        $conference->setCreateRequest($request);
        $event->setConferenceData($conference);

        $created = $service->events->insert('primary', $event, [
            'conferenceDataVersion' => 1,
            'sendUpdates' => 'all',
        ]);

        return [
            'google_event_id' => $created->getId(),
            'google_meet_id' => optional($created->getConferenceData())->getConferenceId(),
            'meet_url' => $created->getHangoutLink(),
            'calendar_event_url' => $created->getHtmlLink(),
        ];
    }

    public function updateEvent(GoogleAccount $account, Meeting $meeting): void
    {
        if (! $meeting->google_event_id) {
            return;
        }

        $service = $this->service($account);
        $event = $service->events->get('primary', $meeting->google_event_id);

        $event->setSummary($meeting->title);
        $event->setDescription($meeting->description);
        $event->setStart($this->dateTime($meeting->scheduled_start_at, $meeting->timezone));
        $event->setEnd($this->dateTime($meeting->scheduled_end_at, $meeting->timezone));
        $event->setAttendees($this->attendees($meeting));

        $service->events->update('primary', $meeting->google_event_id, $event, [
            'sendUpdates' => 'all',
        ]);
    }

    public function deleteEvent(GoogleAccount $account, string $eventId): void
    {
        $this->service($account)->events->delete('primary', $eventId, [
            'sendUpdates' => 'all',
        ]);
    }

    protected function dateTime(\DateTimeInterface $dt, string $timezone): EventDateTime
    {
        return new EventDateTime([
            'dateTime' => $dt->format(\DateTimeInterface::RFC3339),
            'timeZone' => $timezone,
        ]);
    }

    /** Build attendee list from participants (users + guests). */
    protected function attendees(Meeting $meeting): array
    {
        return $meeting->participants()
            ->with('user')
            ->get()
            ->map(fn ($p) => $p->user?->email ?? $p->guest_email)
            ->filter()
            ->unique()
            ->map(fn ($email) => new EventAttendee(['email' => $email]))
            ->values()
            ->all();
    }
}

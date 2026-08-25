<?php

namespace App\Actions\Meetings;

use App\Models\Department;
use App\Models\Meeting;
use App\Models\Project;
use App\Models\User;
use App\Jobs\Google\ScheduleGoogleEvent;
use Illuminate\Support\Facades\DB;

/**
 * Creates a meeting with its participants and agenda in one transaction.
 *
 * Google Calendar/Meet creation is intentionally decoupled: when
 * create_google_meet is requested, we leave a clean seam for Milestone 3 to
 * dispatch a ScheduleGoogleEvent job. The meeting is fully usable without it.
 */
class CreateMeeting
{
    public function handle(User $organizer, array $data): Meeting
    {
        return DB::transaction(function () use ($organizer, $data) {
            $meeting = Meeting::create([
                'organizer_id' => $organizer->id,
                'project_id' => $this->resolveId(Project::class, $data['project_id'] ?? null),
                'department_id' => $this->resolveId(Department::class, $data['department_id'] ?? null),
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'objective' => $data['objective'] ?? null,
                'status' => $data['status'] ?? 'scheduled',
                'visibility' => $data['visibility'] ?? 'organization',
                'primary_language' => $data['primary_language'] ?? 'en',
                'languages' => $data['languages'] ?? null,
                'timezone' => $data['timezone'],
                'scheduled_start_at' => $data['scheduled_start_at'],
                'scheduled_end_at' => $data['scheduled_end_at'],
                'is_recurring' => $data['is_recurring'] ?? false,
                'recurrence_rule' => $data['recurrence_rule'] ?? null,
            ]);

            if (app()->environment('local') && ! $meeting->artifacts()->exists()) {
                $meeting->artifacts()->create([
                    'type' => 'transcript',
                    'source' => 'upload',
                    'storage_path' => 'demo://'.$meeting->ulid,
                    'mime_type' => 'text/plain',
                    'status' => 'available',
                    'metadata' => ['demo' => true],
                ]);

                $meeting->update(['meet_url' => 'https://meet.google.com/new']);
            }

            $this->syncParticipants($meeting, $organizer, $data['participants'] ?? []);
            $this->createAgenda($meeting, $data['agenda'] ?? []);

            if ($data['create_google_meet'] ?? false) {
                ScheduleGoogleEvent::dispatch($meeting->id);
            }

            return $meeting->load(['organizer', 'project', 'participants.user', 'agendaItems']);
        });
    }

    protected function syncParticipants(Meeting $meeting, User $organizer, array $participants): void
    {
        // Always include the organizer as a participant.
        $meeting->participants()->create([
            'user_id' => $organizer->id,
            'role_in_meeting' => 'organizer',
            'is_organizer' => true,
            'response_status' => 'accepted',
        ]);

        foreach ($participants as $p) {
            $userId = isset($p['user_id'])
                ? User::where('ulid', $p['user_id'])->value('id')
                : null;

            if ($userId === $organizer->id) {
                continue; // already added
            }

            $meeting->participants()->create([
                'user_id' => $userId,
                'guest_name' => $userId ? null : ($p['name'] ?? null),
                'guest_email' => $userId ? null : ($p['email'] ?? null),
                'role_in_meeting' => 'attendee',
            ]);
        }
    }

    protected function createAgenda(Meeting $meeting, array $agenda): void
    {
        foreach (array_values($agenda) as $i => $item) {
            $meeting->agendaItems()->create([
                'position' => $i,
                'title' => $item['title'],
                'description' => $item['description'] ?? null,
                'duration_minutes' => $item['duration_minutes'] ?? null,
            ]);
        }
    }

    /** Resolve a public ULID to an internal id (models are org-scoped). */
    protected function resolveId(string $modelClass, ?string $ulid): ?int
    {
        if (! $ulid) {
            return null;
        }

        return $modelClass::where('ulid', $ulid)->value('id');
    }
}

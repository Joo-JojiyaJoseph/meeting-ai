<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MeetingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'title' => $this->title,
            'description' => $this->description,
            'objective' => $this->objective,
            'status' => $this->status,
            'visibility' => $this->visibility,

            'primary_language' => $this->primary_language,
            'languages' => $this->languages,

            'timezone' => $this->timezone,
            'scheduled_start_at' => $this->scheduled_start_at,
            'scheduled_end_at' => $this->scheduled_end_at,
            'actual_start_at' => $this->actual_start_at,
            'actual_end_at' => $this->actual_end_at,
            'duration_seconds' => $this->duration_seconds,

            'is_recurring' => (bool) $this->is_recurring,
            'recurrence_rule' => $this->recurrence_rule,

            'ai_processing_status' => $this->ai_processing_status,
            'ai_processing_enabled' => (bool) $this->ai_processing_enabled,

            'google' => [
                'event_id' => $this->google_event_id,
                'meet_id' => $this->google_meet_id,
                'meet_url' => $this->meet_url,
                'calendar_event_url' => $this->calendar_event_url,
            ],

            'organizer' => new UserResource($this->whenLoaded('organizer')),
            'project' => new ProjectResource($this->whenLoaded('project')),
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'participants' => ParticipantResource::collection($this->whenLoaded('participants')),
            'agenda' => AgendaResource::collection($this->whenLoaded('agendaItems')),

            'participants_count' => $this->whenCounted('participants'),
            'action_items_count' => $this->whenCounted('actionItems'),
            'decisions_count' => $this->whenCounted('decisions'),

            'created_at' => $this->created_at,
        ];
    }
}

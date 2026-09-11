<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'guest_name' => $this->guest_name,
            'guest_email' => $this->guest_email,
            'role_in_meeting' => $this->role_in_meeting,
            'response_status' => $this->response_status,
            'join_status' => $this->join_status,
            'join_requested_at' => $this->join_requested_at,
            'is_organizer' => (bool) $this->is_organizer,
            'attended' => $this->attended,
        ];
    }
}

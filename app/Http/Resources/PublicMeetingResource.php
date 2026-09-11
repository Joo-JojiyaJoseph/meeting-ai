<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * What an unauthenticated person following a share link/code is allowed to
 * see before they've been let in — no description, transcript, or internal
 * ids. Just enough to confirm "yes, this is the right meeting".
 */
class PublicMeetingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->title,
            'organizer_name' => $this->whenLoaded('organizer', fn () => $this->organizer->name),
            'scheduled_start_at' => $this->scheduled_start_at,
            'scheduled_end_at' => $this->scheduled_end_at,
            'status' => $this->status,
        ];
    }
}

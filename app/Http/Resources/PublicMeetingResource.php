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
            // The whole point of a share link is to hand this out, so it's
            // safe (and the point) to expose it here — this is the real
            // Google Meet meeting; our app is only the interface around it.
            // Google Meet's own "ask to join" / host-admit flow governs who
            // actually gets into the call, not anything on our side.
            'meet_url' => $this->meet_url,
        ];
    }
}

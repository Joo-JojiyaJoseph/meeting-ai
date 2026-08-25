<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgendaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'position' => $this->position,
            'title' => $this->title,
            'description' => $this->description,
            'duration_minutes' => $this->duration_minutes,
            'is_completed' => (bool) $this->is_completed,
            'discussed_status' => $this->discussed_status,   // AI-filled post-meeting (§16)
            'ai_confidence' => $this->ai_confidence,
        ];
    }
}

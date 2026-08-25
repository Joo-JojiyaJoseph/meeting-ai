<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SpeakerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'display_name' => $this->display_name ?? $this->user?->name,
            'is_mapped' => (bool) $this->is_mapped,
            'user' => new UserResource($this->whenLoaded('user')),
            'total_speaking_seconds' => $this->total_speaking_seconds,
            'segment_count' => $this->segment_count,
        ];
    }
}

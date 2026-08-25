<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'title' => $this->title,
            'content' => $this->content,
            'status' => $this->status,
            'language' => $this->language,
            'current_version' => $this->current_version,
            'generated_by_ai' => (bool) $this->generated_by_ai,
            'approved_at' => $this->approved_at,
            'published_at' => $this->published_at,
        ];
    }
}

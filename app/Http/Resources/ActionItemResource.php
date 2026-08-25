<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActionItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'title' => $this->title,
            'description' => $this->description,
            'assignee_name_raw' => $this->assignee_name_raw,
            'assignee' => new UserResource($this->whenLoaded('assignee')),
            'due_date' => $this->due_date,
            'due_date_confidence' => $this->due_date_confidence,
            'priority' => $this->priority,
            'source_timestamp_ms' => $this->source_timestamp_ms,
            'ai_confidence' => $this->ai_confidence,
            'status' => $this->status,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DecisionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'topic' => $this->topic,
            'decision' => $this->decision,
            'context' => $this->context,
            'source_timestamp_ms' => $this->source_timestamp_ms,
            'ai_confidence' => $this->ai_confidence,
            'status' => $this->status,
            'created_by_ai' => (bool) $this->created_by_ai,
            'meeting' => $this->whenLoaded('meeting', fn () => [
                'id' => $this->meeting->ulid,
                'title' => $this->meeting->title,
                'scheduled_start_at' => $this->meeting->scheduled_start_at,
            ]),
            'project' => $this->whenLoaded('project', fn () => $this->project ? [
                'id' => $this->project->ulid,
                'name' => $this->project->name,
            ] : null),
            'created_at' => $this->created_at,
        ];
    }
}

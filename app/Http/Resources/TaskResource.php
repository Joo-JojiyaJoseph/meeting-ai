<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'due_date' => $this->due_date,
            'completed_at' => $this->completed_at,
            'is_overdue' => $this->isOverdue(),
            'source_timestamp_ms' => $this->source_timestamp_ms,
            'assignee' => new UserResource($this->whenLoaded('assignee')),
            'creator' => new UserResource($this->whenLoaded('creator')),
            'project' => $this->whenLoaded('project', fn () => [
                'id' => $this->project?->ulid,
                'name' => $this->project?->name,
            ]),
            'meeting' => $this->whenLoaded('meeting', fn () => $this->meeting ? [
                'id' => $this->meeting->ulid,
                'title' => $this->meeting->title,
            ] : null),
            'comments_count' => $this->whenCounted('comments'),
            'created_at' => $this->created_at,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'name' => $this->name,
            'slug' => $this->slug,
            'code' => $this->code,
            'description' => $this->description,
            'color' => $this->color,
            'status' => $this->status,
            'starts_on' => $this->starts_on,
            'ends_on' => $this->ends_on,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'owner' => new UserResource($this->whenLoaded('owner')),
            'meetings_count' => $this->whenCounted('meetings'),
            'tasks_count' => $this->whenCounted('tasks'),
            'created_at' => $this->created_at,
        ];
    }
}

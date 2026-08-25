<?php

namespace App\Http\Resources;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Wraps a User loaded via the organization_user pivot, exposing their
 * membership metadata (role, department, status) for the current org.
 */
class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $roleId = $this->pivot->role_id ?? null;

        return [
            'id' => $this->ulid,
            'name' => $this->name,
            'email' => $this->email,
            'avatar_url' => $this->avatar_path,
            'title' => $this->pivot->title ?? null,
            'status' => $this->pivot->status ?? null,
            'role' => $roleId ? new RoleResource(Role::find($roleId)) : null,
            'department_id' => $this->pivot->department_id ?? null,
            'joined_at' => $this->pivot->joined_at ?? null,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,                 // public identifier, never the bigint PK
            'name' => $this->name,
            'email' => $this->email,
            'avatar_url' => $this->avatar_path,
            'phone' => $this->phone,
            'timezone' => $this->timezone,
            'locale' => $this->locale,
            'is_super_admin' => (bool) $this->is_super_admin,
            'two_factor_enabled' => $this->two_factor_confirmed_at !== null,
            'email_verified' => $this->email_verified_at !== null,
            'created_at' => $this->created_at,
        ];
    }
}

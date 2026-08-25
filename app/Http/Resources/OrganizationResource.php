<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'name' => $this->name,
            'slug' => $this->slug,
            'logo_url' => $this->logo_path,
            'timezone' => $this->timezone,
            'default_locale' => $this->default_locale,
            'status' => $this->status,
            'privacy' => [
                'ai_processing_enabled' => (bool) $this->ai_processing_enabled,
                'ai_search_enabled' => (bool) $this->ai_search_enabled,
                'speaker_identification_enabled' => (bool) $this->speaker_identification_enabled,
                'transcript_retention_days' => $this->transcript_retention_days,
                'recording_retention_days' => $this->recording_retention_days,
            ],
            // The caller's role in this org, when loaded via a membership pivot.
            'role' => $this->whenPivotLoaded('organization_user', fn () => [
                'status' => $this->pivot->status,
                'role_id' => $this->pivot->role_id,
            ]),
        ];
    }
}

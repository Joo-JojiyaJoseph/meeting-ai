<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RiskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'severity' => $this->severity,
            'mitigation' => $this->mitigation,
            'status' => $this->status,
            'source_timestamp_ms' => $this->source_timestamp_ms,
            'ai_confidence' => $this->ai_confidence,
        ];
    }
}

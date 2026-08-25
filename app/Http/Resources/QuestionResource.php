<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question' => $this->question,
            'context' => $this->context,
            'is_resolved' => (bool) $this->is_resolved,
            'source_timestamp_ms' => $this->source_timestamp_ms,
            'ai_confidence' => $this->ai_confidence,
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TranscriptSegmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sequence' => $this->sequence,
            'speaker' => $this->speaker?->display_name ?? $this->speaker?->label,
            'start_ms' => (int) $this->start_ms,
            'end_ms' => (int) $this->end_ms,
            'language' => $this->language,
            'text' => $this->text,
            'is_bookmarked' => (bool) $this->is_bookmarked,
        ];
    }
}

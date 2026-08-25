<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // executive_summary is stored newline-joined; expose as an array.
            'executive_summary' => array_values(array_filter(
                explode("\n", (string) $this->executive_summary)
            )),
            'detailed_summary' => $this->detailed_summary,
            'key_points' => $this->key_points ?? [],
            'next_steps' => $this->next_steps ?? [],
            'language' => $this->language,
            'generated_at' => $this->generated_at,
            'is_edited' => (bool) $this->is_edited,
        ];
    }
}

<?php

namespace App\Models;

use App\Enums\AiConfidence;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeetingQuestion extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'ai_confidence' => AiConfidence::class,
            'is_resolved' => 'boolean',
            'source_timestamp_ms' => 'integer',
        ];
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }
}

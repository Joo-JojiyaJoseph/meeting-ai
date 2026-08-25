<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeetingSummary extends Model
{
    protected $table = 'meeting_summaries';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'key_points' => 'array',
            'next_steps' => 'array',
            'is_edited' => 'boolean',
            'generated_at' => 'datetime',
        ];
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeetingSpeaker extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'is_mapped' => 'boolean',
            'total_speaking_seconds' => 'integer',
            'segment_count' => 'integer',
        ];
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function segments(): HasMany
    {
        return $this->hasMany(TranscriptSegment::class, 'speaker_id');
    }
}

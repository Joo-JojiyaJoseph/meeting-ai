<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Holds ORIGINAL-language text only. Translations live in
 * transcript_translations and never overwrite this (spec §23).
 */
class TranscriptSegment extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'sequence' => 'integer',
            'start_ms' => 'integer',
            'end_ms' => 'integer',
            'confidence' => 'float',
            'is_bookmarked' => 'boolean',
        ];
    }

    public function transcript(): BelongsTo
    {
        return $this->belongsTo(MeetingTranscript::class, 'transcript_id');
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function speaker(): BelongsTo
    {
        return $this->belongsTo(MeetingSpeaker::class, 'speaker_id');
    }

    public function translations(): HasMany
    {
        return $this->hasMany(TranscriptTranslation::class, 'segment_id');
    }
}

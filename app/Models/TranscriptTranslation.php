<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TranscriptTranslation extends Model
{
    protected $guarded = ['id'];

    public function segment(): BelongsTo
    {
        return $this->belongsTo(TranscriptSegment::class, 'segment_id');
    }

    public function transcript(): BelongsTo
    {
        return $this->belongsTo(MeetingTranscript::class, 'transcript_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

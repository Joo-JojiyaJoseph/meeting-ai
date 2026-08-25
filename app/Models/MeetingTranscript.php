<?php

namespace App\Models;

use App\Models\Concerns\HasUlid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeetingTranscript extends Model
{
    use HasUlid;

    protected $guarded = ['id', 'ulid'];

    protected function casts(): array
    {
        return [
            'detected_languages' => 'array',
            'word_count' => 'integer',
        ];
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function artifact(): BelongsTo
    {
        return $this->belongsTo(MeetingArtifact::class, 'artifact_id');
    }

    public function segments(): HasMany
    {
        return $this->hasMany(TranscriptSegment::class, 'transcript_id')->orderBy('sequence');
    }
}

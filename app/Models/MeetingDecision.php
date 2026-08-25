<?php

namespace App\Models;

use App\Enums\AiConfidence;
use App\Enums\DecisionStatus;
use App\Models\Concerns\HasUlid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** Scoped via its meeting; carries source_timestamp_ms for grounding (§53). */
class MeetingDecision extends Model
{
    use HasUlid, SoftDeletes;

    protected $guarded = ['id', 'ulid'];

    protected function casts(): array
    {
        return [
            'status' => DecisionStatus::class,
            'ai_confidence' => AiConfidence::class,
            'created_by_ai' => 'boolean',
            'source_timestamp_ms' => 'integer',
        ];
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function decidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}

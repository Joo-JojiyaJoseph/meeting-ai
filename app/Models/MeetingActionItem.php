<?php

namespace App\Models;

use App\Enums\ActionItemStatus;
use App\Enums\AiConfidence;
use App\Enums\TaskPriority;
use App\Models\Concerns\HasUlid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/** Staged AI extraction; becomes a Task on acceptance (spec §25). */
class MeetingActionItem extends Model
{
    use HasUlid;

    protected $guarded = ['id', 'ulid'];

    protected function casts(): array
    {
        return [
            'status' => ActionItemStatus::class,
            'priority' => TaskPriority::class,
            'ai_confidence' => AiConfidence::class,
            'due_date' => 'date',
            'created_by_ai' => 'boolean',
            'source_timestamp_ms' => 'integer',
        ];
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_user_id');
    }

    public function task(): HasOne
    {
        return $this->hasOne(Task::class, 'action_item_id');
    }
}

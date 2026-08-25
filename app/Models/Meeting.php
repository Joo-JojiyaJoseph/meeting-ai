<?php

namespace App\Models;

use App\Enums\AiProcessingStatus;
use App\Enums\MeetingStatus;
use App\Enums\MeetingVisibility;
use App\Models\Concerns\BelongsToOrganization;
use App\Models\Concerns\HasUlid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Meeting extends Model
{
    use BelongsToOrganization, HasFactory, HasUlid, SoftDeletes;

    protected $guarded = ['id', 'ulid', 'organization_id'];

    protected function casts(): array
    {
        return [
            'status' => MeetingStatus::class,
            'visibility' => MeetingVisibility::class,
            'ai_processing_status' => AiProcessingStatus::class,
            'languages' => 'array',
            'ai_processing_enabled' => 'boolean',
            'is_recurring' => 'boolean',
            'scheduled_start_at' => 'datetime',
            'scheduled_end_at' => 'datetime',
            'actual_start_at' => 'datetime',
            'actual_end_at' => 'datetime',
            'duration_seconds' => 'integer',
        ];
    }

    // --- Relationships -----------------------------------------------------

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(MeetingParticipant::class);
    }

    public function agendaItems(): HasMany
    {
        return $this->hasMany(MeetingAgenda::class)->orderBy('position');
    }

    public function artifacts(): HasMany
    {
        return $this->hasMany(MeetingArtifact::class);
    }

    public function speakers(): HasMany
    {
        return $this->hasMany(MeetingSpeaker::class);
    }

    public function transcript(): HasOne
    {
        return $this->hasOne(MeetingTranscript::class);
    }

    public function segments(): HasMany
    {
        return $this->hasMany(TranscriptSegment::class);
    }

    public function summary(): HasOne
    {
        return $this->hasOne(MeetingSummary::class);
    }

    public function topics(): HasMany
    {
        return $this->hasMany(MeetingTopic::class);
    }

    public function decisions(): HasMany
    {
        return $this->hasMany(MeetingDecision::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(MeetingQuestion::class);
    }

    public function risks(): HasMany
    {
        return $this->hasMany(MeetingRisk::class);
    }

    public function actionItems(): HasMany
    {
        return $this->hasMany(MeetingActionItem::class);
    }

    public function minutes(): HasOne
    {
        return $this->hasOne(MinutesOfMeeting::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function recurrenceParent(): BelongsTo
    {
        return $this->belongsTo(Meeting::class, 'recurrence_parent_id');
    }

    // --- Helpers -----------------------------------------------------------

    public function isProcessed(): bool
    {
        return $this->ai_processing_status === AiProcessingStatus::Completed;
    }
}

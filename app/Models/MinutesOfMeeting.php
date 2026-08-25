<?php

namespace App\Models;

use App\Enums\MomStatus;
use App\Models\Concerns\BelongsToOrganization;
use App\Models\Concerns\HasUlid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MinutesOfMeeting extends Model
{
    use BelongsToOrganization, HasUlid, SoftDeletes;

    protected $table = 'minutes_of_meetings';

    protected $guarded = ['id', 'ulid', 'organization_id'];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'status' => MomStatus::class,
            'current_version' => 'integer',
            'generated_by_ai' => 'boolean',
            'approved_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }

    public function meeting(): BelongsTo
    {
        return $this->belongsTo(Meeting::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(MomVersion::class)->orderByDesc('version');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(MomApproval::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}

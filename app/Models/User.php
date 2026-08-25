<?php

namespace App\Models;

use App\Models\Concerns\HasUlid;
use App\Support\OrganizationContext;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Membership in organizations is many-to-many, so User is NOT org-scoped and
 * carries no organization_id. Role/department are properties of the membership.
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUlid, Notifiable, SoftDeletes;

    protected $guarded = ['id', 'ulid', 'is_super_admin'];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_codes' => 'encrypted:array',
            'two_factor_confirmed_at' => 'datetime',
            'is_super_admin' => 'boolean',
            'last_login_at' => 'datetime',
        ];
    }

    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class, 'organization_user')
            ->using(OrganizationUser::class)
            ->withPivot(['role_id', 'department_id', 'title', 'status', 'joined_at'])
            ->withTimestamps();
    }

    /** The membership row for a given organization (or the current one). */
    public function membershipFor(?Organization $organization = null): ?OrganizationUser
    {
        $organization ??= app(OrganizationContext::class)->organization();

        if (! $organization) {
            return null;
        }

        return OrganizationUser::query()
            ->where('user_id', $this->id)
            ->where('organization_id', $organization->id)
            ->first();
    }

    public function roleIn(?Organization $organization = null): ?Role
    {
        $roleId = $this->membershipFor($organization)?->role_id;

        return $roleId ? Role::find($roleId) : null;
    }

    /**
     * Permission-based check (spec §8). Super admins bypass. Otherwise resolve
     * the user's role in the (current) organization and test its permissions.
     */
    public function hasPermission(string $permission, ?Organization $organization = null): bool
    {
        if ($this->is_super_admin) {
            return true;
        }

        $roleId = $this->membershipFor($organization)?->role_id;

        if (! $roleId) {
            return false;
        }

        return Role::whereKey($roleId)
            ->whereHas('permissions', fn ($q) => $q->where('slug', $permission))
            ->exists();
    }
}

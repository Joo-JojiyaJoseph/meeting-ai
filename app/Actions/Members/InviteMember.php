<?php

namespace App\Actions\Members;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Invites a member to an organization. If no user exists for the email, a shell
 * user is created in 'invited' status (they set a password via the invite link).
 * Existing users are simply attached. Idempotent per (org, user).
 */
class InviteMember
{
    public function handle(Organization $organization, string $email, ?string $roleSlug, ?int $departmentId = null): User
    {
        return DB::transaction(function () use ($organization, $email, $roleSlug, $departmentId) {
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => Str::before($email, '@'),
                    'password' => Str::password(24),
                    'status' => 'invited',
                ],
            );

            $roleId = $roleSlug
                ? Role::where('organization_id', $organization->id)->where('slug', $roleSlug)->value('id')
                : null;

            // syncWithoutDetaching keeps the invite idempotent.
            $organization->users()->syncWithoutDetaching([
                $user->id => [
                    'role_id' => $roleId,
                    'department_id' => $departmentId,
                    'status' => $user->wasRecentlyCreated ? 'invited' : 'active',
                    'joined_at' => now(),
                ],
            ]);

            // TODO: dispatch an invitation notification (Milestone 12 wiring).

            return $user;
        });
    }
}

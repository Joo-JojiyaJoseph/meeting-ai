<?php

namespace App\Policies;

use App\Models\Organization;
use App\Models\User;

class OrganizationPolicy
{
    public function before(User $user): ?bool
    {
        return $user->is_super_admin ? true : null;
    }

    public function view(User $user, Organization $organization): bool
    {
        return $user->organizations()->whereKey($organization->id)->exists();
    }

    public function update(User $user, Organization $organization): bool
    {
        return $user->hasPermission('organizations.update', $organization);
    }

    public function manageSettings(User $user, Organization $organization): bool
    {
        return $user->hasPermission('organizations.manage_settings', $organization);
    }

    public function manageMembers(User $user, Organization $organization): bool
    {
        return $user->hasPermission('members.invite', $organization)
            || $user->hasPermission('members.manage_roles', $organization);
    }
}

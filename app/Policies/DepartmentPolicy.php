<?php

namespace App\Policies;

use App\Models\Department;
use App\Models\User;

class DepartmentPolicy
{
    public function before(User $user): ?bool
    {
        return $user->is_super_admin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('departments.view');
    }

    public function view(User $user, Department $department): bool
    {
        return $user->hasPermission('departments.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('departments.create');
    }

    public function update(User $user, Department $department): bool
    {
        return $user->hasPermission('departments.update');
    }

    public function delete(User $user, Department $department): bool
    {
        return $user->hasPermission('departments.delete');
    }
}

<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function before(User $user): ?bool
    {
        return $user->is_super_admin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('tasks.view');
    }

    public function view(User $user, Task $task): bool
    {
        return $user->hasPermission('tasks.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('tasks.create');
    }

    public function update(User $user, Task $task): bool
    {
        return $this->isOwner($user, $task)
            || $user->hasPermission('tasks.update');
    }

    public function delete(User $user, Task $task): bool
    {
        return $user->hasPermission('tasks.delete');
    }

    public function assign(User $user, Task $task): bool
    {
        return $user->hasPermission('tasks.assign');
    }

    /** Assignee and creator can always update their own task. */
    protected function isOwner(User $user, Task $task): bool
    {
        return $task->assignee_id === $user->id
            || $task->created_by === $user->id;
    }
}

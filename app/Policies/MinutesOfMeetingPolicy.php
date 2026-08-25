<?php

namespace App\Policies;

use App\Models\MinutesOfMeeting;
use App\Models\User;

class MinutesOfMeetingPolicy
{
    public function before(User $user): ?bool
    {
        return $user->is_super_admin ? true : null;
    }

    public function view(User $user, MinutesOfMeeting $mom): bool
    {
        return $user->hasPermission('mom.view')
            && $user->can('view', $mom->meeting);
    }

    public function update(User $user, MinutesOfMeeting $mom): bool
    {
        return $this->isOrganizer($user, $mom)
            || $user->hasPermission('mom.edit');
    }

    public function approve(User $user, MinutesOfMeeting $mom): bool
    {
        return $this->isOrganizer($user, $mom)
            || $user->hasPermission('mom.approve');
    }

    public function distribute(User $user, MinutesOfMeeting $mom): bool
    {
        return $this->isOrganizer($user, $mom)
            || $user->hasPermission('mom.distribute');
    }

    protected function isOrganizer(User $user, MinutesOfMeeting $mom): bool
    {
        return $mom->meeting?->organizer_id === $user->id;
    }
}

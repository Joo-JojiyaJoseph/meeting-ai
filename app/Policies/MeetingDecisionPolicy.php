<?php

namespace App\Policies;

use App\Models\MeetingDecision;
use App\Models\User;

class MeetingDecisionPolicy
{
    public function before(User $user): ?bool
    {
        return $user->is_super_admin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('decisions.view');
    }

    public function view(User $user, MeetingDecision $decision): bool
    {
        return $user->hasPermission('decisions.view')
            && $user->can('view', $decision->meeting);
    }

    public function manage(User $user, MeetingDecision $decision): bool
    {
        return $decision->meeting?->organizer_id === $user->id
            || $user->hasPermission('decisions.manage');
    }
}

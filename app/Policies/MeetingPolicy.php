<?php

namespace App\Policies;

use App\Enums\MeetingVisibility;
use App\Models\Meeting;
use App\Models\User;

class MeetingPolicy
{
    /** Super admins bypass all checks (spec §8). */
    public function before(User $user): ?bool
    {
        return $user->is_super_admin ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermission('meetings.view');
    }

    public function view(User $user, Meeting $meeting): bool
    {
        return $user->hasPermission('meetings.view')
            && $this->hasAccess($user, $meeting);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('meetings.create');
    }

    public function update(User $user, Meeting $meeting): bool
    {
        return $this->isOrganizer($user, $meeting)
            || $user->hasPermission('meetings.update');
    }

    public function delete(User $user, Meeting $meeting): bool
    {
        return $this->isOrganizer($user, $meeting)
            || $user->hasPermission('meetings.delete');
    }

    public function manageParticipants(User $user, Meeting $meeting): bool
    {
        return $this->isOrganizer($user, $meeting)
            || $user->hasPermission('meetings.manage_participants');
    }

    public function viewTranscript(User $user, Meeting $meeting): bool
    {
        return $user->hasPermission('transcripts.view')
            && $this->hasAccess($user, $meeting);
    }

    public function editTranscript(User $user, Meeting $meeting): bool
    {
        return $this->hasAccess($user, $meeting)
            && ($this->isOrganizer($user, $meeting) || $user->hasPermission('transcripts.edit'));
    }

    // --- Access model ------------------------------------------------------

    protected function isOrganizer(User $user, Meeting $meeting): bool
    {
        return $meeting->organizer_id === $user->id;
    }

    protected function isParticipant(User $user, Meeting $meeting): bool
    {
        return $meeting->participants()->where('user_id', $user->id)->exists();
    }

    /**
     * Organizer and explicit participants always have access. Beyond that,
     * only organization-visible meetings are open to the wider org; private and
     * confidential meetings are restricted to those two groups (spec §40).
     */
    protected function hasAccess(User $user, Meeting $meeting): bool
    {
        if ($this->isOrganizer($user, $meeting) || $this->isParticipant($user, $meeting)) {
            return true;
        }

        return $meeting->visibility === MeetingVisibility::Organization;
    }
}

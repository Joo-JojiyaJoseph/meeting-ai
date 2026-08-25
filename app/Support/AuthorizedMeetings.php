<?php

namespace App\Support;

use App\Enums\MeetingVisibility;
use App\Models\Meeting;
use App\Models\User;

/**
 * The single source of truth for "which meetings may this user read?" — used by
 * every AI retrieval path so the assistant/search can NEVER surface content from
 * a meeting the user can't open (spec §25, §40).
 *
 * Mirrors MeetingPolicy::hasAccess: organizer or participant always; plus
 * organization-visible meetings when the user holds meetings.view. Private and
 * confidential meetings stay restricted to organizer/participant.
 */
class AuthorizedMeetings
{
    /** @return array<int> internal meeting ids (org scope already applied) */
    public static function idsFor(User $user): array
    {
        if ($user->is_super_admin) {
            return Meeting::query()->pluck('id')->all();
        }

        $canSeeOrgWide = $user->hasPermission('meetings.view');

        return Meeting::query()
            ->where(function ($q) use ($user, $canSeeOrgWide) {
                $q->where('organizer_id', $user->id)
                    ->orWhereHas('participants', fn ($p) => $p->where('user_id', $user->id));

                if ($canSeeOrgWide) {
                    $q->orWhere('visibility', MeetingVisibility::Organization->value);
                }
            })
            ->pluck('id')
            ->all();
    }
}

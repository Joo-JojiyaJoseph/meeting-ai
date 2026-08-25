<?php

namespace App\Jobs\Google;

use App\Models\GoogleAccount;
use App\Models\Meeting;
use App\Models\Organization;
use App\Support\OrganizationContext;

/**
 * Shared helpers for Google jobs: load the meeting without global scopes, run
 * inside its organization context, and resolve the organizer's active Google
 * account for that org.
 */
trait ResolvesGoogleContext
{
    protected function withMeeting(int $meetingId, callable $callback): void
    {
        $meeting = Meeting::withoutGlobalScopes()->find($meetingId);
        if (! $meeting) {
            return;
        }

        $organization = Organization::withoutGlobalScopes()->findOrFail($meeting->organization_id);

        app(OrganizationContext::class)->run($organization, function () use ($meeting, $callback) {
            $callback($meeting);
        });
    }

    protected function googleAccountFor(Meeting $meeting): ?GoogleAccount
    {
        return GoogleAccount::withoutGlobalScopes()
            ->where('organization_id', $meeting->organization_id)
            ->where('user_id', $meeting->organizer_id)
            ->where('is_active', true)
            ->first();
    }
}

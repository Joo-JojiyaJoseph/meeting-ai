<?php

namespace App\Services\Notifications;

use App\Enums\MeetingStatus;
use App\Models\InAppNotification;
use App\Models\Meeting;
use App\Models\User;
use App\Support\OrganizationContext;
use Illuminate\Support\Str;

class NotificationService
{
    public function __construct(protected OrganizationContext $context) {}

    public function send(User $user, string $type, array $data, ?int $organizationId = null): InAppNotification
    {
        return InAppNotification::create([
            'id' => (string) Str::uuid(),
            'type' => $type,
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'organization_id' => $organizationId ?? $this->context->id(),
            'data' => $data,
        ]);
    }

    public function notifyMeetingParticipants(Meeting $meeting, string $type, array $data, ?int $exceptUserId = null): void
    {
        $meeting->loadMissing('participants.user');

        foreach ($meeting->participants as $participant) {
            if (! $participant->user) {
                continue;
            }
            if ($exceptUserId && $participant->user_id === $exceptUserId) {
                continue;
            }
            $this->send($participant->user, $type, $data, $meeting->organization_id);
        }
    }

    public function seedStartingSoon(User $user): void
    {
        $upcoming = Meeting::query()
            ->where('status', MeetingStatus::Scheduled)
            ->where('scheduled_start_at', '>', now())
            ->where('scheduled_start_at', '<=', now()->addMinutes(30))
            ->where(function ($query) use ($user) {
                $query->where('organizer_id', $user->id)
                    ->orWhereHas('participants', fn ($p) => $p->where('user_id', $user->id));
            })
            ->get();

        foreach ($upcoming as $meeting) {
            $exists = InAppNotification::query()
                ->where('notifiable_type', User::class)
                ->where('notifiable_id', $user->id)
                ->where('type', 'meeting.starting_soon')
                ->where('data->meeting_id', $meeting->ulid)
                ->exists();

            if ($exists) {
                continue;
            }

            $minutes = max(1, (int) now()->diffInMinutes($meeting->scheduled_start_at, false));
            $this->send($user, 'meeting.starting_soon', [
                'title' => 'Meeting starting soon',
                'body' => "{$meeting->title} starts in {$minutes} minutes.",
                'url' => '/meetings/'.$meeting->ulid.'/join',
                'meeting_id' => $meeting->ulid,
            ], $meeting->organization_id);
        }
    }

    public function forUser(User $user, int $limit = 30)
    {
        $this->seedStartingSoon($user);

        return InAppNotification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $user->id)
            ->when($this->context->id(), fn ($q) => $q->where(function ($inner) {
                $inner->where('organization_id', $this->context->id())
                    ->orWhereNull('organization_id');
            }))
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function unreadCount(User $user): int
    {
        $this->seedStartingSoon($user);

        return InAppNotification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $user->id)
            ->when($this->context->id(), fn ($q) => $q->where(function ($inner) {
                $inner->where('organization_id', $this->context->id())
                    ->orWhereNull('organization_id');
            }))
            ->unread()
            ->count();
    }

    public function markRead(User $user, string $id): void
    {
        InAppNotification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $user->id)
            ->whereKey($id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function markAllRead(User $user): void
    {
        InAppNotification::query()
            ->where('notifiable_type', User::class)
            ->where('notifiable_id', $user->id)
            ->when($this->context->id(), fn ($q) => $q->where(function ($inner) {
                $inner->where('organization_id', $this->context->id())
                    ->orWhereNull('organization_id');
            }))
            ->unread()
            ->update(['read_at' => now()]);
    }
}

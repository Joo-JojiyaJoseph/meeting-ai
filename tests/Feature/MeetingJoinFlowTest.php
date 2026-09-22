<?php

namespace Tests\Feature;

use App\Models\Meeting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\CreatesOrganizations;
use Tests\TestCase;

class MeetingJoinFlowTest extends TestCase
{
    use RefreshDatabase;
    use CreatesOrganizations;

    protected function makeMeeting($organization, $organizer, array $attrs = []): Meeting
    {
        return app(\App\Support\OrganizationContext::class)->run($organization, fn () => Meeting::create(array_merge([
            'organizer_id' => $organizer->id,
            'title' => 'Weekly sync',
            'timezone' => 'UTC',
            'scheduled_start_at' => now()->addDay(),
            'scheduled_end_at' => now()->addDay()->addHour(),
        ], $attrs)));
    }

    public function test_public_landing_returns_safe_fields_for_a_valid_code(): void
    {
        [$owner, $org] = $this->createUserWithOrganization();
        $meeting = $this->makeMeeting($org, $owner, ['meet_url' => 'https://meet.google.com/abc-defg-hij']);

        $response = $this->getJson("/api/v1/meetings/join/{$meeting->share_code}");

        $response->assertOk()
            ->assertJsonPath('data.title', 'Weekly sync')
            ->assertJsonPath('data.meet_url', 'https://meet.google.com/abc-defg-hij')
            ->assertJsonMissingPath('data.id')
            ->assertJsonMissingPath('data.description');
    }

    public function test_invalid_share_code_returns_404(): void
    {
        $this->getJson('/api/v1/meetings/join/NOTAREALCODE')->assertStatus(404);
    }

    public function test_a_guest_can_request_to_join_and_lands_in_pending(): void
    {
        [$owner, $org] = $this->createUserWithOrganization();
        $meeting = $this->makeMeeting($org, $owner);

        $response = $this->postJson("/api/v1/meetings/join/{$meeting->share_code}", [
            'name' => 'Jamie Guest',
            'email' => 'jamie@example.com',
        ]);

        $response->assertCreated()->assertJsonPath('join_status', 'pending');
        $this->assertDatabaseHas('meeting_participants', [
            'meeting_id' => $meeting->id,
            'guest_name' => 'Jamie Guest',
            'join_status' => 'pending',
        ]);
    }

    public function test_join_request_requires_a_name(): void
    {
        [$owner, $org] = $this->createUserWithOrganization();
        $meeting = $this->makeMeeting($org, $owner);

        $this->postJson("/api/v1/meetings/join/{$meeting->share_code}", [])
            ->assertStatus(422);
    }

    public function test_status_polling_reflects_pending_then_approved(): void
    {
        [$owner, $org] = $this->createUserWithOrganization();
        $meeting = $this->makeMeeting($org, $owner, ['meet_url' => 'https://meet.google.com/abc-defg-hij']);

        $join = $this->postJson("/api/v1/meetings/join/{$meeting->share_code}", ['name' => 'Jamie Guest']);
        $token = $join->json('request_token');

        $this->getJson("/api/v1/meetings/join/{$meeting->share_code}/{$token}")
            ->assertOk()
            ->assertJsonPath('join_status', 'pending')
            ->assertJsonPath('meet_url', null);

        $participant = $meeting->participants()->where('request_token', $token)->firstOrFail();
        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/meetings/{$meeting->ulid}/participants/{$participant->id}/approve")
            ->assertOk();

        $this->getJson("/api/v1/meetings/join/{$meeting->share_code}/{$token}")
            ->assertOk()
            ->assertJsonPath('join_status', 'approved')
            ->assertJsonPath('meet_url', 'https://meet.google.com/abc-defg-hij');
    }

    public function test_organizer_can_see_and_approve_pending_requests(): void
    {
        [$owner, $org] = $this->createUserWithOrganization();
        $meeting = $this->makeMeeting($org, $owner);
        $this->postJson("/api/v1/meetings/join/{$meeting->share_code}", ['name' => 'Jamie Guest']);

        $list = $this->actingAs($owner, 'sanctum')
            ->getJson("/api/v1/meetings/{$meeting->ulid}/join-requests");

        $list->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.guest_name', 'Jamie Guest');
    }

    public function test_organizer_can_deny_a_pending_request(): void
    {
        [$owner, $org] = $this->createUserWithOrganization();
        $meeting = $this->makeMeeting($org, $owner);
        $join = $this->postJson("/api/v1/meetings/join/{$meeting->share_code}", ['name' => 'Jamie Guest']);
        $token = $join->json('request_token');
        $participant = $meeting->participants()->where('request_token', $token)->firstOrFail();

        $this->actingAs($owner, 'sanctum')
            ->postJson("/api/v1/meetings/{$meeting->ulid}/participants/{$participant->id}/deny")
            ->assertOk();

        $this->getJson("/api/v1/meetings/join/{$meeting->share_code}/{$token}")
            ->assertJsonPath('join_status', 'denied');
    }

    public function test_a_non_organizer_without_permission_cannot_approve_requests(): void
    {
        [$owner, $org] = $this->createUserWithOrganization(['email' => 'owner@acme.test']);
        $meeting = $this->makeMeeting($org, $owner);
        $join = $this->postJson("/api/v1/meetings/join/{$meeting->share_code}", ['name' => 'Jamie Guest']);
        $participantId = $meeting->participants()->where('request_token', $join->json('request_token'))->value('id');

        $colleague = \App\Models\User::factory()->create(['email' => 'colleague@acme.test']);
        $org->users()->attach($colleague->id, [
            'role_id' => \App\Models\Role::where('organization_id', $org->id)->where('slug', 'employee')->value('id'),
            'status' => 'active',
            'joined_at' => now(),
        ]);

        $this->actingAs($colleague, 'sanctum')
            ->postJson("/api/v1/meetings/{$meeting->ulid}/participants/{$participantId}/approve")
            ->assertStatus(403);
    }

    public function test_unauthenticated_users_cannot_list_join_requests(): void
    {
        [$owner, $org] = $this->createUserWithOrganization();
        $meeting = $this->makeMeeting($org, $owner);

        $this->getJson("/api/v1/meetings/{$meeting->ulid}/join-requests")->assertStatus(401);
    }
}

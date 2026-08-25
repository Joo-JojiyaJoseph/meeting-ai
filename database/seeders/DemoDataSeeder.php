<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Meeting;
use App\Models\Organization;
use App\Models\Project;
use App\Models\Role;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::updateOrCreate(
            ['slug' => 'technova'],
            [
                'name' => 'TechNova Labs',
                'domain' => 'technova.example',
                'timezone' => 'UTC',
                'plan' => 'pro',
                'status' => 'active',
            ],
        );

        app(RoleSeeder::class)->seedForOrganization($organization);

        $admin = User::updateOrCreate(
            ['email' => 'admin@technova.example'],
            [
                'name' => 'Alex Morgan',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ],
        );

        $adminRole = Role::where('organization_id', $organization->id)
            ->where('slug', 'org_admin')
            ->firstOrFail();

        $organization->users()->syncWithoutDetaching([
            $admin->id => [
                'role_id' => $adminRole->id,
                'status' => 'active',
                'joined_at' => now(),
            ],
        ]);

        $department = Department::updateOrCreate(
            ['organization_id' => $organization->id, 'slug' => 'product'],
            [
                'name' => 'Product',
                'head_user_id' => $admin->id,
                'description' => 'Product strategy and delivery',
            ],
        );

        $project = Project::updateOrCreate(
            ['organization_id' => $organization->id, 'slug' => 'platform-refresh'],
            [
                'name' => 'Platform Refresh',
                'code' => 'PLAT-24',
                'description' => 'Improve the meeting intelligence experience.',
                'owner_id' => $admin->id,
                'department_id' => $department->id,
                'color' => '#7C3AED',
                'status' => 'active',
                'starts_on' => today()->subDays(14),
                'ends_on' => today()->addDays(60),
            ],
        );

        $standup = Meeting::updateOrCreate(
            ['organization_id' => $organization->id, 'google_event_id' => 'demo-standup'],
            [
                'project_id' => $project->id,
                'department_id' => $department->id,
                'organizer_id' => $admin->id,
                'title' => 'Product standup',
                'description' => 'Daily product and engineering sync.',
                'status' => 'scheduled',
                'visibility' => 'organization',
                'primary_language' => 'en',
                'languages' => ['en'],
                'timezone' => 'UTC',
                'scheduled_start_at' => today()->setTime(9, 30),
                'scheduled_end_at' => today()->setTime(10, 0),
                'ai_processing_status' => 'completed',
                'ai_processing_enabled' => true,
                'meet_url' => 'https://meet.google.com/demo-standup',
            ],
        );

        Meeting::updateOrCreate(
            ['organization_id' => $organization->id, 'google_event_id' => 'demo-planning'],
            [
                'project_id' => $project->id,
                'department_id' => $department->id,
                'organizer_id' => $admin->id,
                'title' => 'Platform refresh planning',
                'description' => 'Prioritize the next product milestone.',
                'status' => 'scheduled',
                'visibility' => 'organization',
                'primary_language' => 'en',
                'languages' => ['en'],
                'timezone' => 'UTC',
                'scheduled_start_at' => today()->setTime(14, 0),
                'scheduled_end_at' => today()->setTime(15, 0),
                'ai_processing_status' => 'pending',
                'ai_processing_enabled' => true,
                'meet_url' => 'https://meet.google.com/demo-planning',
            ],
        );

        Task::updateOrCreate(
            ['organization_id' => $organization->id, 'title' => 'Review transcript action items'],
            [
                'project_id' => $project->id,
                'meeting_id' => $standup->id,
                'assignee_id' => $admin->id,
                'created_by' => $admin->id,
                'description' => 'Confirm owners and due dates from the latest standup.',
                'status' => 'in_progress',
                'priority' => 'high',
                'due_date' => today()->addDays(2),
            ],
        );

        Task::updateOrCreate(
            ['organization_id' => $organization->id, 'title' => 'Prepare planning agenda'],
            [
                'project_id' => $project->id,
                'meeting_id' => $standup->id,
                'assignee_id' => $admin->id,
                'created_by' => $admin->id,
                'description' => 'Add metrics, risks, and decisions to the planning agenda.',
                'status' => 'pending',
                'priority' => 'medium',
                'due_date' => today()->addDays(4),
            ],
        );
    }
}

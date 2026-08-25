<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Seeds the system-wide super_admin role, and provides seedForOrganization()
 * to create the four org-scoped default roles for a tenant. Call the latter
 * from your "create organization" flow (an observer or action) so every new
 * org gets its roles. Idempotent.
 */
class RoleSeeder extends Seeder
{
    /** Org-scoped default roles → permission slugs. */
    public static function organizationRoles(): array
    {
        return [
            'org_admin' => [
                'name' => 'Organization Admin',
                'permissions' => PermissionSeeder::allSlugs(), // full org control
            ],
            'manager' => [
                'name' => 'Manager',
                'permissions' => array_merge(
                    PermissionSeeder::slugsForGroups(['decisions', 'action_items', 'ai', 'analytics']),
                    ['members.view', 'departments.view', 'knowledge.view'],
                    ['projects.view', 'projects.create', 'projects.update'],
                    ['meetings.view', 'meetings.create', 'meetings.update', 'meetings.manage_participants'],
                    ['transcripts.view', 'transcripts.edit', 'transcripts.map_speakers'],
                    ['tasks.view', 'tasks.create', 'tasks.update', 'tasks.assign'],
                    ['mom.view', 'mom.edit', 'mom.approve', 'mom.distribute'],
                ),
            ],
            'meeting_organizer' => [
                'name' => 'Meeting Organizer',
                // Note: organizer powers are ALSO granted relationally by the
                // policies on meetings the user actually organizes.
                'permissions' => array_merge(
                    ['meetings.view', 'meetings.create', 'meetings.update', 'meetings.manage_participants'],
                    ['transcripts.view', 'transcripts.edit', 'transcripts.map_speakers'],
                    ['decisions.view', 'decisions.manage', 'action_items.view', 'action_items.manage'],
                    ['tasks.view', 'tasks.create', 'tasks.assign'],
                    ['mom.view', 'mom.edit', 'mom.approve', 'mom.distribute'],
                    ['ai.search', 'ai.assistant', 'knowledge.view'],
                ),
            ],
            'employee' => [
                'name' => 'Employee',
                'permissions' => [
                    'projects.view',
                    'meetings.view',
                    'transcripts.view',
                    'decisions.view',
                    'action_items.view',
                    'tasks.view', 'tasks.update',
                    'mom.view',
                    'ai.search', 'ai.assistant',
                    'knowledge.view',
                ],
            ],
        ];
    }

    public function run(): void
    {
        // System super admin (organization_id NULL, shared across tenants).
        $this->upsertRole(null, 'super_admin', 'Super Admin', PermissionSeeder::allSlugs(), isSystem: true);
    }

    public function seedForOrganization(Organization $organization): void
    {
        foreach (self::organizationRoles() as $slug => $config) {
            $this->upsertRole($organization->id, $slug, $config['name'], $config['permissions']);
        }
    }

    protected function upsertRole(?int $orgId, string $slug, string $name, array $permissionSlugs, bool $isSystem = false): Role
    {
        $role = Role::updateOrCreate(
            ['organization_id' => $orgId, 'slug' => $slug],
            ['name' => $name, 'is_system' => $isSystem],
        );

        $ids = Permission::whereIn('slug', array_unique($permissionSlugs))->pluck('id');
        $role->permissions()->sync($ids);

        return $role;
    }
}

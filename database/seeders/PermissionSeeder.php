<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

/**
 * The canonical permission catalogue, grouped by domain. Authorization is
 * permission-based (spec §8) — roles are just bundles of these. Idempotent.
 */
class PermissionSeeder extends Seeder
{
    public const PERMISSIONS = [
        'organizations' => [
            'organizations.view' => 'View organization',
            'organizations.update' => 'Update organization',
            'organizations.manage_settings' => 'Manage organization settings',
        ],
        'members' => [
            'members.view' => 'View members',
            'members.invite' => 'Invite members',
            'members.update' => 'Update members',
            'members.remove' => 'Remove members',
            'members.manage_roles' => 'Assign roles',
        ],
        'departments' => [
            'departments.view' => 'View departments',
            'departments.create' => 'Create departments',
            'departments.update' => 'Update departments',
            'departments.delete' => 'Delete departments',
        ],
        'projects' => [
            'projects.view' => 'View projects',
            'projects.create' => 'Create projects',
            'projects.update' => 'Update projects',
            'projects.delete' => 'Delete projects',
        ],
        'meetings' => [
            'meetings.view' => 'View meetings',
            'meetings.create' => 'Create meetings',
            'meetings.update' => 'Update meetings',
            'meetings.delete' => 'Delete meetings',
            'meetings.manage_participants' => 'Manage meeting participants',
        ],
        'transcripts' => [
            'transcripts.view' => 'View transcripts',
            'transcripts.edit' => 'Edit transcripts',
            'transcripts.map_speakers' => 'Map speakers',
        ],
        'decisions' => [
            'decisions.view' => 'View decisions',
            'decisions.manage' => 'Manage decisions',
        ],
        'action_items' => [
            'action_items.view' => 'View action items',
            'action_items.manage' => 'Manage action items',
        ],
        'tasks' => [
            'tasks.view' => 'View tasks',
            'tasks.create' => 'Create tasks',
            'tasks.update' => 'Update tasks',
            'tasks.delete' => 'Delete tasks',
            'tasks.assign' => 'Assign tasks',
        ],
        'mom' => [
            'mom.view' => 'View minutes of meeting',
            'mom.edit' => 'Edit minutes of meeting',
            'mom.approve' => 'Approve minutes of meeting',
            'mom.distribute' => 'Distribute minutes of meeting',
        ],
        'ai' => [
            'ai.search' => 'Use AI search',
            'ai.assistant' => 'Use AI assistant',
        ],
        'knowledge' => [
            'knowledge.view' => 'View knowledge base',
            'knowledge.manage' => 'Manage knowledge base',
        ],
        'integrations' => [
            'integrations.manage' => 'Manage integrations',
        ],
        'ai_settings' => [
            'ai_settings.manage' => 'Manage AI settings',
        ],
        'analytics' => [
            'analytics.view' => 'View analytics',
        ],
        'audit' => [
            'audit.view' => 'View audit logs',
        ],
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $group => $permissions) {
            foreach ($permissions as $slug => $name) {
                Permission::updateOrCreate(
                    ['slug' => $slug],
                    ['name' => $name, 'group' => $group],
                );
            }
        }
    }

    /** Flat list of every permission slug. */
    public static function allSlugs(): array
    {
        return array_merge(...array_map('array_keys', array_values(self::PERMISSIONS)));
    }

    /** All slugs belonging to the given groups. */
    public static function slugsForGroups(array $groups): array
    {
        $slugs = [];
        foreach ($groups as $group) {
            $slugs = array_merge($slugs, array_keys(self::PERMISSIONS[$group] ?? []));
        }
        return $slugs;
    }
}

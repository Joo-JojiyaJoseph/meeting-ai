<?php

namespace App\Actions\Organizations;

use App\Models\Organization;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Service-layer action (spec rule §61.4 — no business logic in controllers).
 *
 * Creates a tenant, provisions its default roles, and attaches the creator as
 * org_admin — all in one transaction so a half-built org can never exist.
 */
class CreateOrganization
{
    public function __construct(protected RoleSeeder $roleSeeder) {}

    public function handle(User $creator, array $data): Organization
    {
        return DB::transaction(function () use ($creator, $data) {
            $organization = Organization::create([
                'name' => $data['name'],
                'slug' => $this->uniqueSlug($data['name']),
                'timezone' => $data['timezone'] ?? 'UTC',
                'default_locale' => $data['default_locale'] ?? 'en',
            ]);

            // Provision the four org-scoped roles for this tenant.
            $this->roleSeeder->seedForOrganization($organization);

            $adminRole = Role::where('organization_id', $organization->id)
                ->where('slug', 'org_admin')
                ->first();

            $creator->organizations()->attach($organization->id, [
                'role_id' => $adminRole?->id,
                'status' => 'active',
                'joined_at' => now(),
            ]);

            return $organization;
        });
    }

    protected function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'org';
        $slug = $base;
        $i = 1;

        while (Organization::where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$i);
        }

        return $slug;
    }
}

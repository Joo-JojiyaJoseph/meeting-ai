<?php

namespace App\Models\Concerns;

use App\Models\Organization;
use App\Scopes\OrganizationScope;
use App\Support\OrganizationContext;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Applied to every tenant-scoped model that carries an organization_id column.
 * Adds the global OrganizationScope and auto-fills organization_id on create
 * from the current context (so application code never has to set it by hand).
 *
 * NOT used on Organization (the tenant root), User (membership is many-to-many),
 * or the RBAC tables Role/Permission (which include cross-tenant system rows).
 */
trait BelongsToOrganization
{
    public static function bootBelongsToOrganization(): void
    {
        static::addGlobalScope(new OrganizationScope);

        static::creating(function ($model) {
            if ($model->organization_id === null) {
                $model->organization_id = app(OrganizationContext::class)->id();
            }
        });
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}

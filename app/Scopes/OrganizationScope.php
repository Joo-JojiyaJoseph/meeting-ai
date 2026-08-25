<?php

namespace App\Scopes;

use App\Support\OrganizationContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

/**
 * Constrains every query on an org-scoped model to the current organization.
 * When no organization is set (console, or a deliberate cross-tenant query via
 * withoutGlobalScope), the scope is a no-op.
 */
class OrganizationScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $orgId = app(OrganizationContext::class)->id();

        if ($orgId !== null) {
            $builder->where($model->getTable().'.organization_id', $orgId);
        }
    }
}

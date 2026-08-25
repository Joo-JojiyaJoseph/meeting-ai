<?php

namespace App\Http\Middleware;

use App\Models\Organization;
use App\Support\OrganizationContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves the active organization for the authenticated user and sets it on the
 * OrganizationContext. The client selects an organization via the X-Organization
 * header (its ULID); we ALWAYS validate that the user is actually a member before
 * honoring it, then fall back to their first active membership.
 */
class SetOrganizationContext
{
    public function __construct(protected OrganizationContext $context) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $organization = $this->resolve($request, $user);

            if ($organization) {
                $this->context->set($organization);
            }
        }

        return $next($request);
    }

    protected function resolve(Request $request, $user): ?Organization
    {
        $requestedUlid = $request->header('X-Organization');

        $memberships = $user->organizations()
            ->wherePivot('status', 'active')
            ->get();

        if ($requestedUlid) {
            $match = $memberships->firstWhere('ulid', $requestedUlid);
            if ($match) {
                return $match;
            }
            // Requested an org the user does not belong to — deny silently by
            // falling through rather than leaking existence.
        }

        return $memberships->first();
    }
}

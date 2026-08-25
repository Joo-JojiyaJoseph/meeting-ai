<?php

namespace App\Support;

use App\Models\Organization;

/**
 * Holds the "current organization" for the lifetime of a request (or job).
 * Bound as a singleton in TenancyServiceProvider and set by the
 * SetOrganizationContext middleware after authentication.
 *
 * The OrganizationScope reads from here to constrain every tenant query.
 */
class OrganizationContext
{
    protected ?Organization $organization = null;

    public function set(?Organization $organization): void
    {
        $this->organization = $organization;
    }

    public function setById(?int $id): void
    {
        $this->organization = $id
            ? Organization::withoutGlobalScopes()->find($id)
            : null;
    }

    public function organization(): ?Organization
    {
        return $this->organization;
    }

    public function id(): ?int
    {
        return $this->organization?->id;
    }

    public function has(): bool
    {
        return $this->organization !== null;
    }

    public function forget(): void
    {
        $this->organization = null;
    }

    /**
     * Run a callback in the context of a specific organization, restoring the
     * previous context afterwards. Useful in queued jobs and console commands.
     */
    public function run(Organization $organization, callable $callback): mixed
    {
        $previous = $this->organization;
        $this->organization = $organization;

        try {
            return $callback();
        } finally {
            $this->organization = $previous;
        }
    }
}

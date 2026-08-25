<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

/** Membership pivot with its own id, role, and department. */
class OrganizationUser extends Pivot
{
    protected $table = 'organization_user';

    public $incrementing = true;

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }
}

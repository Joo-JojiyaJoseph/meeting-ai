<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Generates a public ULID on create and uses it for route-model binding, while
 * keeping the fast bigint primary key for internal foreign keys. This gives
 * unguessable, non-enumerable public identifiers without sacrificing join speed.
 */
trait HasUlid
{
    public static function bootHasUlid(): void
    {
        static::creating(function (Model $model) {
            if (empty($model->ulid)) {
                $model->ulid = (string) Str::ulid();
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'ulid';
    }
}

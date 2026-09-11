<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A short, unguessable code participants can be given (via WhatsApp, copy/paste,
 * etc.) to request to join a meeting without needing an account. Distinct from
 * the internal ulid so it can be rotated/regenerated independently.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meetings', function (Blueprint $table) {
            $table->string('share_code', 12)->nullable()->unique()->after('ulid');
        });
    }

    public function down(): void
    {
        Schema::table('meetings', function (Blueprint $table) {
            $table->dropColumn('share_code');
        });
    }
};

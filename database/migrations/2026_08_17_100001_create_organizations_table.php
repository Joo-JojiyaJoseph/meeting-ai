<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The tenant root. Every tenant-scoped table carries organization_id and is
 * isolated behind a global scope at the model layer (see ARCHITECTURE.md).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique(); // public/route identifier

            $table->string('name');
            $table->string('slug')->unique();
            $table->string('domain')->nullable();          // email domain for auto-join
            $table->string('logo_path')->nullable();

            $table->string('timezone')->default('UTC');
            $table->string('default_locale', 10)->default('en');

            // Privacy / retention controls (spec §41)
            $table->boolean('ai_processing_enabled')->default(true);
            $table->boolean('ai_search_enabled')->default(true);
            $table->boolean('speaker_identification_enabled')->default(true);
            $table->unsignedInteger('transcript_retention_days')->default(90);
            $table->unsignedInteger('recording_retention_days')->default(90);

            $table->json('settings')->nullable();          // misc feature flags
            $table->string('plan')->nullable();
            $table->string('status')->default('active');   // active|suspended|trial
            $table->timestamp('trial_ends_at')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};

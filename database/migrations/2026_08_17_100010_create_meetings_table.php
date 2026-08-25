<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The central entity. Google identifiers are stored here so the app can deep-link
 * back to Calendar/Meet. ai_processing_status mirrors the pipeline states (§22).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('organizer_id')->constrained('users')->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            $table->text('objective')->nullable();

            $table->string('status')->default('scheduled'); // draft|scheduled|in_progress|completed|cancelled
            $table->string('visibility')->default('organization'); // private|confidential|organization

            // Language handling (§18)
            $table->string('primary_language', 10)->default('en');
            $table->json('languages')->nullable();           // expected languages

            // Scheduling
            $table->string('timezone')->default('UTC');
            $table->timestamp('scheduled_start_at');
            $table->timestamp('scheduled_end_at');
            $table->timestamp('actual_start_at')->nullable();
            $table->timestamp('actual_end_at')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();

            // Recurrence
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_rule')->nullable();   // RRULE
            $table->foreignId('recurrence_parent_id')->nullable()->constrained('meetings')->nullOnDelete();

            // AI
            $table->boolean('ai_processing_enabled')->default(true);
            $table->string('ai_processing_status')->default('pending'); // §22 lifecycle

            // Google (§12)
            $table->string('google_event_id')->nullable();
            $table->string('google_meet_id')->nullable();
            $table->string('meet_url')->nullable();
            $table->string('calendar_event_url')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->index(['organization_id', 'status']);
            $table->index(['organization_id', 'scheduled_start_at']);
            $table->index('project_id');
            $table->index('organizer_id');
            $table->index('ai_processing_status');
            $table->index('google_event_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};

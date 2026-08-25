<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Structured content is stored as JSON (the section model from §26); `html`
 * caches the rendered editor output for fast preview/export.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('minutes_of_meetings', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();

            $table->string('title');
            $table->json('content')->nullable();   // structured sections
            $table->longText('html')->nullable();  // rendered cache

            $table->string('status')->default('ai_generated'); // ai_generated|draft|in_review|approved|published
            $table->string('language', 10)->default('en');
            $table->unsignedInteger('current_version')->default(1);
            $table->boolean('generated_by_ai')->default(true);

            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('published_at')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->unique('meeting_id');
            $table->index(['organization_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('minutes_of_meetings');
    }
};

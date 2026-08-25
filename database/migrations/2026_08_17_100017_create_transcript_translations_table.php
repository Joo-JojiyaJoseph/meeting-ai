<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stored separately so the original transcript is preserved (§23). A translation
 * can target a single segment (primary use) or cache a whole-transcript render.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transcript_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('segment_id')->nullable()->constrained('transcript_segments')->cascadeOnDelete();
            $table->foreignId('transcript_id')->nullable()->constrained('meeting_transcripts')->cascadeOnDelete();

            $table->string('target_language', 10);
            $table->longText('text');
            $table->string('source')->default('ai');       // ai|human
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['segment_id', 'target_language']);
            $table->index(['transcript_id', 'target_language']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transcript_translations');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The atomic unit of a transcript. Original text is stored here and NEVER
 * overwritten — translations live in transcript_translations (§19, §23).
 * meeting_id is denormalized for fast per-meeting filtering/authorization.
 * Timestamps use milliseconds for precise "jump to timestamp" deep-links.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transcript_segments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transcript_id')->constrained('meeting_transcripts')->cascadeOnDelete();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('speaker_id')->nullable()->constrained('meeting_speakers')->nullOnDelete();

            $table->unsignedInteger('sequence');
            $table->unsignedBigInteger('start_ms');
            $table->unsignedBigInteger('end_ms');
            $table->string('language', 10)->nullable();
            $table->longText('text');
            $table->float('confidence')->nullable();
            $table->boolean('is_bookmarked')->default(false);
            $table->timestamps();

            $table->unique(['transcript_id', 'sequence']);
            $table->index(['meeting_id', 'start_ms']);
            $table->index('speaker_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transcript_segments');
    }
};

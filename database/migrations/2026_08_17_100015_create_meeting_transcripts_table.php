<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_transcripts', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('artifact_id')->nullable()->constrained('meeting_artifacts')->nullOnDelete();

            $table->string('primary_language', 10)->nullable();
            $table->json('detected_languages')->nullable();   // code-switching (§18)
            $table->unsignedInteger('word_count')->nullable();
            $table->string('provider')->nullable();           // e.g. whisper-large-v3
            $table->string('status')->default('pending');     // pending|processing|completed|failed
            $table->text('processing_error')->nullable();
            $table->timestamps();

            $table->index(['meeting_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_transcripts');
    }
};

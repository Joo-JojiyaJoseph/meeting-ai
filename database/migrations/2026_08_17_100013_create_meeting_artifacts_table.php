<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Raw inputs to the AI pipeline: Meet recordings/transcripts pulled from Google
 * Drive, or manually uploaded audio (the fallback path — see ARCHITECTURE.md).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_artifacts', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();

            $table->string('type')->default('recording');   // recording|audio|transcript|chat|document
            $table->string('source')->default('google_meet'); // google_meet|upload
            $table->string('google_file_id')->nullable();
            $table->string('drive_url')->nullable();

            $table->string('storage_disk')->nullable();
            $table->string('storage_path')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->string('checksum')->nullable();

            $table->string('status')->default('available');  // available|downloading|downloaded|processing|failed
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['meeting_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_artifacts');
    }
};

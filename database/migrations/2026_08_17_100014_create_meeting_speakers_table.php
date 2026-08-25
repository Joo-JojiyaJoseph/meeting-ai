<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Diarized speaker labels, optionally mapped to a real user (§20). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_speakers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('label');                 // "Speaker 1"
            $table->string('display_name')->nullable();
            $table->boolean('is_mapped')->default(false);
            $table->unsignedInteger('total_speaking_seconds')->default(0);
            $table->unsignedInteger('segment_count')->default(0);
            $table->timestamps();

            $table->unique(['meeting_id', 'label']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_speakers');
    }
};

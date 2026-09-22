<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lightweight manual notes a participant jots down live, independent of the
 * AI pipeline (spec: "in-meeting note-taking"). Deliberately separate from
 * meeting_summaries/minutes_of_meetings — those are AI-generated and staged
 * for review; these are the user's own words, saved immediately, never
 * touched by AI processing.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_notes', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->text('content');
            $table->timestamps();

            $table->index(['meeting_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_notes');
    }
};

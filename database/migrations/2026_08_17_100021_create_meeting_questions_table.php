<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Open/unresolved questions surfaced by AI (§23). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();

            $table->text('question');
            $table->text('context')->nullable();
            $table->boolean('is_resolved')->default(false);
            $table->text('resolution')->nullable();
            $table->unsignedBigInteger('source_timestamp_ms')->nullable();
            $table->string('ai_confidence')->nullable();
            $table->timestamps();

            $table->index(['meeting_id', 'is_resolved']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_questions');
    }
};

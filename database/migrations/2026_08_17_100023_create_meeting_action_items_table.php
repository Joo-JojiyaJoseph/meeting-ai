<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AI-extracted action items are staged here for manager review before being
 * converted into real tasks (§25). assignee_name_raw keeps the name as spoken;
 * due_date_confidence flags uncertain deadlines rather than inventing them (§52).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_action_items', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('assignee_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->text('title');
            $table->text('description')->nullable();
            $table->string('assignee_name_raw')->nullable();
            $table->date('due_date')->nullable();
            $table->string('due_date_confidence')->nullable(); // low|medium|high
            $table->string('priority')->default('medium');     // low|medium|high|urgent

            $table->unsignedBigInteger('source_timestamp_ms')->nullable();
            $table->string('ai_confidence')->default('medium');
            $table->boolean('created_by_ai')->default(true);
            $table->string('status')->default('suggested');    // suggested|accepted|rejected|converted
            $table->timestamps();

            $table->index(['meeting_id', 'status']);
            $table->index('assignee_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_action_items');
    }
};

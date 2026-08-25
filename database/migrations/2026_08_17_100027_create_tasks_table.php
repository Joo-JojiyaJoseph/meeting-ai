<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Real, tracked tasks (§31). Every task keeps a link back to its source meeting,
 * originating action item, and transcript timestamp for full traceability.
 * "Overdue" is derived (status != completed && due_date < today), not stored.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('meeting_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('action_item_id')->nullable()->constrained('meeting_action_items')->nullOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('source_timestamp_ms')->nullable();

            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('status')->default('pending');  // pending|in_progress|completed|blocked|cancelled
            $table->string('priority')->default('medium');  // low|medium|high|urgent
            $table->date('due_date')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->index(['organization_id', 'status']);
            $table->index(['assignee_id', 'status']);
            $table->index('project_id');
            $table->index('meeting_id');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};

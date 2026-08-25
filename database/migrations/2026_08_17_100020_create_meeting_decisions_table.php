<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** source_timestamp_ms anchors the decision to the transcript (§53). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_decisions', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();

            $table->string('topic')->nullable();
            $table->text('decision');
            $table->text('context')->nullable();

            $table->unsignedBigInteger('source_timestamp_ms')->nullable();
            $table->string('ai_confidence')->default('medium'); // low|medium|high (§52)
            $table->boolean('created_by_ai')->default(true);

            $table->string('status')->default('proposed'); // proposed|approved|rejected
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();

            $table->softDeletes();
            $table->timestamps();

            $table->index(['meeting_id', 'status']);
            $table->index('project_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_decisions');
    }
};

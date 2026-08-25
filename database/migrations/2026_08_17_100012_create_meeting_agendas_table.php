<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** discussed_status is filled by AI post-meeting (§16). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_agendas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();

            $table->unsignedInteger('position')->default(0);
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->boolean('is_completed')->default(false);

            $table->string('discussed_status')->nullable(); // discussed|partially|not_discussed
            $table->string('ai_confidence')->nullable();     // low|medium|high
            $table->timestamps();

            $table->index(['meeting_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_agendas');
    }
};

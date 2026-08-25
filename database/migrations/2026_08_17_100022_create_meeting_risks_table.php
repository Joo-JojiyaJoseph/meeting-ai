<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_risks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            $table->string('severity')->default('medium'); // low|medium|high
            $table->string('likelihood')->nullable();
            $table->text('mitigation')->nullable();
            $table->string('status')->default('open');     // open|mitigated|closed
            $table->unsignedBigInteger('source_timestamp_ms')->nullable();
            $table->string('ai_confidence')->nullable();
            $table->timestamps();

            $table->index(['meeting_id', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_risks');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** One summary record per meeting holding all summary sections (§23). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();

            $table->longText('executive_summary')->nullable();  // 5-8 bullets
            $table->longText('detailed_summary')->nullable();    // by topic
            $table->json('key_points')->nullable();
            $table->json('next_steps')->nullable();

            $table->string('language', 10)->default('en');
            $table->string('model')->nullable();
            $table->boolean('is_edited')->default(false);
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();

            $table->unique('meeting_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_summaries');
    }
};

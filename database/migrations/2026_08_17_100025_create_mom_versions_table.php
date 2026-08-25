<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Full version history for the MoM editor (§27) — supports diff/rollback. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mom_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('minutes_of_meeting_id')->constrained('minutes_of_meetings')->cascadeOnDelete();

            $table->unsignedInteger('version');
            $table->json('content');
            $table->longText('html')->nullable();
            $table->foreignId('edited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('change_note')->nullable();
            $table->timestamps();

            $table->unique(['minutes_of_meeting_id', 'version']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mom_versions');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Approval trail (§28). Only 'approved' MoMs are distributed automatically. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mom_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('minutes_of_meeting_id')->constrained('minutes_of_meetings')->cascadeOnDelete();
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('action')->default('approved'); // approved|rejected|requested_changes
            $table->unsignedInteger('version')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->index('minutes_of_meeting_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mom_approvals');
    }
};

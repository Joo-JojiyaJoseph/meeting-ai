<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** user_id is NULL for external guests (identified only by email). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('meeting_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('guest_name')->nullable();
            $table->string('guest_email')->nullable();

            $table->string('role_in_meeting')->default('attendee'); // organizer|presenter|attendee
            $table->string('response_status')->default('needs_action'); // accepted|declined|tentative|needs_action
            $table->boolean('is_organizer')->default(false);
            $table->boolean('attended')->nullable();
            $table->timestamps();

            $table->index(['meeting_id', 'user_id']);
            $table->index('guest_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_participants');
    }
};

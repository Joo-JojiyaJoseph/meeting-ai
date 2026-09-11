<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * join_status is the "waiting room" gate for people who requested to join via
 * a shared link/code, separate from response_status (which is calendar-invite
 * RSVP semantics). Participants added directly by the organizer are auto-approved
 * since they were never in a waiting room.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meeting_participants', function (Blueprint $table) {
            $table->string('join_status')->default('approved')->after('response_status'); // pending|approved|denied
            $table->timestamp('join_requested_at')->nullable()->after('join_status');
            // Lets an unauthenticated participant poll their own request's status
            // without exposing/guessing other participants' incrementing ids.
            $table->uuid('request_token')->nullable()->unique()->after('join_requested_at');
        });
    }

    public function down(): void
    {
        Schema::table('meeting_participants', function (Blueprint $table) {
            $table->dropColumn(['join_status', 'join_requested_at']);
        });
    }
};

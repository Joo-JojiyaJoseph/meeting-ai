<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * OAuth credentials for Google Calendar/Meet. Tokens MUST be encrypted at the
 * model layer (encrypted cast) and are never exposed to the SPA (spec §11).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('google_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();

            $table->string('google_user_id');              // OpenID "sub"
            $table->string('email');
            $table->text('access_token');                  // encrypted cast
            $table->text('refresh_token')->nullable();     // encrypted cast
            $table->timestamp('token_expires_at')->nullable();
            $table->json('scopes')->nullable();
            $table->string('avatar')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['organization_id', 'user_id']);
            $table->index('google_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('google_accounts');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Retrievable text chunks. `source` is polymorphic so a chunk can originate from
 * a transcript, decision, MoM, or uploaded document. organization_id + meeting_id
 * are denormalized so retrieval can filter by tenant AND authorized meetings in
 * one indexed query — the guard that stops AI leaking unauthorized content (§25, §40).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('knowledge_document_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('meeting_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('source');            // meeting/transcript/decision/mom/document

            $table->longText('content');
            $table->unsignedInteger('chunk_index')->default(0);
            $table->unsignedInteger('token_count')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index('organization_id');
            $table->index('meeting_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_chunks');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Vector store for semantic search (§34, §54).
 *
 * On PostgreSQL this uses the pgvector extension and an HNSW index — the
 * recommended production path. On other drivers (e.g. MySQL) the vector is
 * stored as JSON and similarity is computed by the Python AI service or an
 * external vector DB. See ARCHITECTURE.md → "Vector search".
 */
return new class extends Migration
{
    public function up(): void
    {
        $isPgsql = DB::connection()->getDriverName() === 'pgsql';

        if ($isPgsql) {
            DB::statement('CREATE EXTENSION IF NOT EXISTS vector');
        }

        Schema::create('embeddings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('knowledge_chunk_id')->constrained()->cascadeOnDelete();

            $table->string('model')->default('text-embedding-3-small');
            $table->unsignedInteger('dimensions')->default(1536);

            // pgsql: real vector column added below. Other drivers: JSON fallback.
            $table->json('vector_json')->nullable();

            $table->timestamps();

            $table->unique('knowledge_chunk_id');
            $table->index('organization_id');
        });

        if ($isPgsql) {
            DB::statement('ALTER TABLE embeddings ADD COLUMN vector vector(1536)');
            // Approximate-nearest-neighbour index (cosine distance).
            DB::statement('CREATE INDEX embeddings_vector_hnsw ON embeddings USING hnsw (vector vector_cosine_ops)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('embeddings');
    }
};

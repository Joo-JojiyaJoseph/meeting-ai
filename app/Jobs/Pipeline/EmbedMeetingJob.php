<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Models\Embedding;
use App\Models\KnowledgeChunk;
use App\Models\Meeting;
use App\Services\AI\AiClient;
use Illuminate\Support\Facades\DB;

/**
 * Chunks the transcript, embeds each chunk, and indexes it for semantic search.
 * organization_id + meeting_id on each chunk are what let retrieval enforce
 * tenant + authorized-meeting filtering before any vector query (§34, §40).
 *
 * On PostgreSQL, copy vector_json into the real pgvector column via a raw upsert
 * (see ARCHITECTURE.md → Vector search); the JSON is the portable fallback.
 */
class EmbedMeetingJob extends PipelineJob
{
    protected function status(): AiProcessingStatus
    {
        return AiProcessingStatus::Indexing;
    }

    protected function process(Meeting $meeting, AiClient $ai): void
    {
        // Group ~6 segments per chunk to keep chunks semantically coherent.
        $segments = $meeting->segments()->orderBy('start_ms')->get();
        $chunks = $segments->chunk(6)->values();

        if ($chunks->isEmpty()) {
            return;
        }

        // Reindex from scratch (idempotent).
        $meeting->load('organization');
        KnowledgeChunk::where('meeting_id', $meeting->id)->delete();

        $created = [];
        foreach ($chunks as $i => $group) {
            $chunk = KnowledgeChunk::create([
                'meeting_id' => $meeting->id,
                'source_type' => Meeting::class,
                'source_id' => $meeting->id,
                'content' => $group->pluck('text')->implode(' '),
                'chunk_index' => $i,
                'metadata' => [
                    'start_ms' => (int) $group->first()->start_ms,
                    'end_ms' => (int) $group->last()->end_ms,
                ],
            ]);
            $created[$chunk->id] = $chunk;
        }

        $result = $ai->embed([
            'items' => collect($created)->map(fn ($c) => [
                'id' => (string) $c->id,
                'text' => $c->content,
            ])->values()->all(),
            'model' => config('ai.embedding.model'),
        ]);

        DB::transaction(function () use ($result) {
            foreach ($result['embeddings'] ?? [] as $emb) {
                Embedding::updateOrCreate(
                    ['knowledge_chunk_id' => (int) $emb['id']],
                    [
                        'model' => $result['model'] ?? config('ai.embedding.model'),
                        'dimensions' => $result['dimensions'] ?? config('ai.embedding.dimensions'),
                        'vector_json' => $emb['vector'],
                    ],
                );
            }
        });
    }
}

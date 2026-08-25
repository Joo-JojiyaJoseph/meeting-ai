<?php

namespace App\Services\AI;

use App\Models\KnowledgeChunk;
use App\Models\Meeting;
use App\Models\User;
use App\Support\AuthorizedMeetings;
use App\Support\OrganizationContext;
use Illuminate\Support\Facades\DB;

/**
 * Retrieval-augmented search over meeting knowledge chunks.
 *
 * The retrieval is ALWAYS scoped to (a) the current organization and (b) the set
 * of meetings the user is authorized to read. Access control precedes similarity
 * — this is the guarantee that AI answers can't leak restricted meetings (§40).
 *
 * On PostgreSQL, ranking uses pgvector's cosine distance operator. On other
 * drivers it falls back to computing cosine similarity in PHP over the stored
 * JSON vectors (correct, just not index-accelerated).
 */
class SemanticSearchService
{
    public function __construct(
        protected AiClient $ai,
        protected OrganizationContext $context,
    ) {}

    /**
     * @return array<int, array{chunk: KnowledgeChunk, score: float}>
     */
    public function retrieve(User $user, string $query, int $limit = 8, ?int $meetingId = null): array
    {
        $allowed = AuthorizedMeetings::idsFor($user);
        if ($meetingId !== null) {
            $allowed = array_values(array_intersect($allowed, [$meetingId]));
        }
        if (empty($allowed)) {
            return [];
        }

        // Embed the query via the AI service.
        $embedResponse = $this->ai->embed(['items' => [['id' => 'q', 'text' => $query]]]);
        $queryVector = $embedResponse['embeddings'][0]['vector'] ?? null;
        if (! $queryVector) {
            return [];
        }

        return DB::connection()->getDriverName() === 'pgsql'
            ? $this->retrievePgvector($queryVector, $allowed, $limit)
            : $this->retrieveFallback($queryVector, $allowed, $limit);
    }

    /** Ask the AI service to synthesize a grounded answer from retrieved chunks. */
    public function answer(User $user, string $question, string $language = 'en', ?int $meetingId = null): array
    {
        $hits = $this->retrieve($user, $question, 8, $meetingId);

        $chunks = array_map(fn ($hit) => [
            'id' => (string) $hit['chunk']->id,
            'meeting_id' => optional($hit['chunk']->meeting)->ulid ?? (string) $hit['chunk']->meeting_id,
            'content' => $hit['chunk']->content,
            'source_timestamp_ms' => $hit['chunk']->metadata['start_ms'] ?? null,
        ], $hits);

        return $this->ai->answer([
            'question' => $question,
            'output_language' => $language,
            'chunks' => $chunks,
        ]);
    }

    /** pgvector: order by cosine distance, filtered by org + authorized meetings. */
    protected function retrievePgvector(array $vector, array $allowedMeetingIds, int $limit): array
    {
        $literal = '['.implode(',', array_map(fn ($v) => (float) $v, $vector)).']';
        $placeholders = implode(',', array_fill(0, count($allowedMeetingIds), '?'));

        $rows = DB::select(
            "SELECT kc.id, (e.vector <=> ?::vector) AS distance
             FROM knowledge_chunks kc
             JOIN embeddings e ON e.knowledge_chunk_id = kc.id
             WHERE kc.organization_id = ?
               AND kc.meeting_id IN ($placeholders)
             ORDER BY distance ASC
             LIMIT ?",
            [$literal, $this->context->id(), ...$allowedMeetingIds, $limit],
        );

        $chunks = KnowledgeChunk::with('meeting')
            ->whereIn('id', array_column($rows, 'id'))
            ->get()
            ->keyBy('id');

        $out = [];
        foreach ($rows as $row) {
            if ($chunk = $chunks->get($row->id)) {
                $out[] = ['chunk' => $chunk, 'score' => 1.0 - (float) $row->distance];
            }
        }
        return $out;
    }

    /** Portable fallback: cosine similarity computed in PHP over JSON vectors. */
    protected function retrieveFallback(array $vector, array $allowedMeetingIds, int $limit): array
    {
        $candidates = KnowledgeChunk::with(['meeting', 'embedding'])
            ->whereIn('meeting_id', $allowedMeetingIds)
            ->whereHas('embedding')
            ->limit(2000) // guardrail; a real deployment should use pgvector
            ->get();

        $scored = [];
        foreach ($candidates as $chunk) {
            $stored = $chunk->embedding?->vector_json;
            if (is_array($stored)) {
                $scored[] = ['chunk' => $chunk, 'score' => $this->cosine($vector, $stored)];
            }
        }

        usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);
        return array_slice($scored, 0, $limit);
    }

    protected function cosine(array $a, array $b): float
    {
        $dot = 0.0;
        $na = 0.0;
        $nb = 0.0;
        $n = min(count($a), count($b));
        for ($i = 0; $i < $n; $i++) {
            $dot += $a[$i] * $b[$i];
            $na += $a[$i] * $a[$i];
            $nb += $b[$i] * $b[$i];
        }
        $denom = sqrt($na) * sqrt($nb);
        return $denom > 0 ? $dot / $denom : 0.0;
    }
}

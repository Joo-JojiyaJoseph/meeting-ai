<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AI\SearchRequest;
use App\Services\AI\SemanticSearchService;
use App\Support\OrganizationContext;
use Illuminate\Http\JsonResponse;

/**
 * Organization-wide semantic search (spec §34). Returns ranked chunks with the
 * meeting + timestamp they came from — retrieval only, no LLM synthesis.
 */
class SearchController extends Controller
{
    public function __construct(
        protected SemanticSearchService $search,
        protected OrganizationContext $context,
    ) {}

    public function search(SearchRequest $request): JsonResponse
    {
        abort_unless(
            (bool) $this->context->organization()?->ai_search_enabled,
            403,
            'AI search is disabled for this organization.',
        );

        $hits = $this->search->retrieve(
            $request->user(),
            $request->string('q'),
            $request->integer('limit', 8),
        );

        $results = array_map(fn ($hit) => [
            'meeting_id' => $hit['chunk']->meeting?->ulid,
            'meeting_title' => $hit['chunk']->meeting?->title,
            'chunk_id' => $hit['chunk']->id,
            'snippet' => \Illuminate\Support\Str::limit($hit['chunk']->content, 240),
            'source_timestamp_ms' => $hit['chunk']->metadata['start_ms'] ?? null,
            'score' => round($hit['score'], 4),
        ], $hits);

        return response()->json(['data' => $results]);
    }
}

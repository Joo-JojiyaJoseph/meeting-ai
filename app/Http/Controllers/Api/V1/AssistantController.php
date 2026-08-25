<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AI\AskRequest;
use App\Models\Meeting;
use App\Services\AI\SemanticSearchService;
use App\Support\OrganizationContext;
use Illuminate\Http\JsonResponse;

/**
 * The conversational AI assistant (spec §33). Answers are grounded in the
 * retrieved, authorized context and returned with source citations that resolve
 * to a meeting + timestamp the client can deep-link to.
 */
class AssistantController extends Controller
{
    public function __construct(
        protected SemanticSearchService $search,
        protected OrganizationContext $context,
    ) {}

    public function ask(AskRequest $request): JsonResponse
    {
        $this->assertAiSearchEnabled();

        $meetingId = null;
        if ($request->filled('meeting_id')) {
            // Authorize the specific meeting before scoping to it.
            $meeting = Meeting::where('ulid', $request->meeting_id)->firstOrFail();
            $this->authorize('view', $meeting);
            $meetingId = $meeting->id;
        }

        $result = $this->search->answer(
            $request->user(),
            $request->string('question'),
            $request->input('language', 'en'),
            $meetingId,
        );

        return response()->json([
            'answer' => $result['answer'] ?? '',
            'used_context' => $result['used_context'] ?? false,
            'citations' => $result['citations'] ?? [],
        ]);
    }

    protected function assertAiSearchEnabled(): void
    {
        abort_unless(
            (bool) $this->context->organization()?->ai_search_enabled,
            403,
            'AI search is disabled for this organization.',
        );
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\MeetingArtifactReady;
use App\Http\Controllers\Controller;
use App\Http\Requests\Artifacts\StoreArtifactRequest;
use App\Models\Meeting;
use Illuminate\Http\JsonResponse;

class MeetingArtifactController extends Controller
{
    /** Register a recording/transcript artifact and optionally start processing. */
    public function store(StoreArtifactRequest $request, Meeting $meeting): JsonResponse
    {
        $this->authorize('update', $meeting);

        $artifact = $meeting->artifacts()->create([
            ...$request->safe()->except('process'),
            'status' => 'available',
        ]);

        if ($request->boolean('process', true)) {
            event(new MeetingArtifactReady($meeting));
        }

        return response()->json([
            'message' => 'Artifact registered.',
            'artifact_id' => $artifact->ulid,
            'processing' => $request->boolean('process', true),
        ], 201);
    }
}

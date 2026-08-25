<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\GoogleAccount;
use App\Support\OrganizationContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Connection status + disconnect for the current user in the current org. The
 * OAuth connect flow (redirect/callback) lives in Auth\GoogleAuthController.
 */
class GoogleIntegrationController extends Controller
{
    public function show(Request $request, OrganizationContext $context): JsonResponse
    {
        $account = GoogleAccount::where('user_id', $request->user()->id)
            ->where('organization_id', $context->id())
            ->where('is_active', true)
            ->first();

        return response()->json([
            'connected' => $account !== null,
            'email' => $account?->email,
            'scopes' => $account?->scopes ?? [],
            'expires_at' => $account?->token_expires_at,
        ]);
    }

    public function destroy(Request $request, OrganizationContext $context): JsonResponse
    {
        GoogleAccount::where('user_id', $request->user()->id)
            ->where('organization_id', $context->id())
            ->delete();

        return response()->json(['message' => 'Google account disconnected.']);
    }
}

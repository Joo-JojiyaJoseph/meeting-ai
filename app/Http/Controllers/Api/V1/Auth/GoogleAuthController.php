<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\GoogleAccount;
use App\Models\User;
use App\Support\OrganizationContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

/**
 * Google serves two purposes: social login, and connecting Calendar/Meet access.
 * Tokens are persisted (encrypted) on google_accounts and NEVER returned to the
 * client (spec §11). We use stateless OAuth since the SPA holds no session.
 */
class GoogleAuthController extends Controller
{
    protected array $calendarScopes = [
        'openid', 'email', 'profile',
        'https://www.googleapis.com/auth/calendar.events',
        // For pulling Meet recordings/transcripts (Workspace only, see
        // GoogleMeetArtifactService). Safe to request; artifact sync degrades
        // gracefully when unavailable and the manual-upload path still works.
        'https://www.googleapis.com/auth/meetings.space.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
    ];

    /** Returns the Google consent URL for the SPA to redirect to. */
    public function redirect(Request $request): JsonResponse
    {
        $url = Socialite::driver('google')
            ->stateless()
            ->scopes($this->calendarScopes)
            ->with(['access_type' => 'offline', 'prompt' => 'consent'])
            ->redirect()
            ->getTargetUrl();

        return response()->json(['url' => $url]);
    }

    /** Handles the OAuth callback: logs the user in and stores their tokens. */
    public function callback(Request $request): JsonResponse
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name' => $googleUser->getName() ?: Str::before($googleUser->getEmail(), '@'),
                'password' => Str::password(32),
                'avatar_path' => $googleUser->getAvatar(),
                'email_verified_at' => now(), // Google verifies the email
            ],
        );

        $organization = app(OrganizationContext::class)->organization()
            ?? $user->organizations()->wherePivot('status', 'active')->first();

        if ($organization) {
            GoogleAccount::updateOrCreate(
                ['user_id' => $user->id, 'organization_id' => $organization->id],
                [
                    'google_user_id' => $googleUser->getId(),
                    'email' => $googleUser->getEmail(),
                    'access_token' => $googleUser->token,
                    'refresh_token' => $googleUser->refreshToken,
                    'token_expires_at' => now()->addSeconds((int) ($googleUser->expiresIn ?? 3600)),
                    'scopes' => $this->calendarScopes,
                    'avatar' => $googleUser->getAvatar(),
                    'is_active' => true,
                ],
            );
        }

        $token = $user->createToken('google-spa')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
            'google_connected' => $organization !== null,
        ]);
    }
}

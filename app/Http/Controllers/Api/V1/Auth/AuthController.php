<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\OrganizationContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password, // hashed by cast
            'timezone' => $request->input('timezone', 'UTC'),
            'locale' => $request->input('locale', 'en'),
        ]);

        $token = $user->createToken($request->input('device_name', 'spa'))->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        $user = $request->user() ?? Auth::user();
        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        $token = $user->createToken($request->input('device_name', 'spa'))->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
            'organizations' => OrganizationResource::collection(
                $user->organizations()->wherePivot('status', 'active')->get()
            ),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $context = app(OrganizationContext::class);
        $organization = $context->organization();

        return response()->json([
            'user' => new UserResource($user),
            'current_organization' => $organization ? new OrganizationResource($organization) : null,
            'organizations' => OrganizationResource::collection(
                $user->organizations()->wherePivot('status', 'active')->get()
            ),
            'permissions' => $organization
                ? ($user->roleIn($organization)?->permissions->pluck('slug')->values() ?? [])
                : [],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}

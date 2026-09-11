<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Members\InviteMember;
use App\Http\Controllers\Controller;
use App\Http\Requests\Members\InviteMemberRequest;
use App\Http\Requests\Members\UpdateMemberRequest;
use App\Http\Resources\MemberResource;
use App\Models\Role;
use App\Models\User;
use App\Services\Notifications\NotificationService;
use App\Support\OrganizationContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MemberController extends Controller
{
    public function __construct(protected OrganizationContext $context) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $organization = $this->context->organization();
        $this->authorize('view', $organization);

        $perPage = min(max($request->integer('per_page', 25), 1), 100);

        return MemberResource::collection(
            $organization->users()->paginate($perPage)
        );
    }

    public function store(InviteMemberRequest $request, InviteMember $action): JsonResponse
    {
        $organization = $this->context->organization();
        $this->authorize('manageMembers', $organization);

        $user = $action->handle(
            $organization,
            $request->email,
            $request->role,
            $request->input('department_id'),
        );

        $member = $organization->users()->whereKey($user->id)->first();

        app(NotificationService::class)->send($user, 'member.invited', [
            'title' => 'You were invited',
            'body' => 'You now have access to '.$organization->name.'.',
            'url' => '/dashboard',
        ], $organization->id);

        if (! $member) {
            return response()->json(['message' => 'Member invited.'], 201);
        }

        return (new MemberResource($member))->response()->setStatusCode(201);
    }

    public function update(UpdateMemberRequest $request, User $user): JsonResponse
    {
        $organization = $this->context->organization();
        $this->authorize('manageMembers', $organization);

        $pivot = [];

        if ($request->filled('role')) {
            $pivot['role_id'] = Role::where('organization_id', $organization->id)
                ->where('slug', $request->role)
                ->value('id');
        }
        if ($request->has('department_id')) {
            $pivot['department_id'] = $request->input('department_id');
        }
        if ($request->filled('status')) {
            $pivot['status'] = $request->status;
        }

        $organization->users()->updateExistingPivot($user->id, $pivot);

        return response()->json(['message' => 'Member updated.']);
    }

    public function destroy(User $user): JsonResponse
    {
        $organization = $this->context->organization();
        $this->authorize('manageMembers', $organization);

        $organization->users()->detach($user->id);

        return response()->json(['message' => 'Member removed.']);
    }
}

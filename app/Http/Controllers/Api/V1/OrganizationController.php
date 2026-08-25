<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Organizations\CreateOrganization;
use App\Http\Controllers\Controller;
use App\Http\Requests\Organizations\StoreOrganizationRequest;
use App\Http\Requests\Organizations\UpdateOrganizationRequest;
use App\Http\Resources\OrganizationResource;
use App\Models\Organization;
use App\Support\OrganizationContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrganizationController extends Controller
{
    /** Organizations the authenticated user belongs to. */
    public function index(Request $request): AnonymousResourceCollection
    {
        return OrganizationResource::collection(
            $request->user()->organizations()->wherePivot('status', 'active')->get()
        );
    }

    /** The currently-active organization (from context). */
    public function current(): JsonResponse
    {
        $organization = app(OrganizationContext::class)->organization();

        return response()->json([
            'data' => $organization ? new OrganizationResource($organization) : null,
        ]);
    }

    public function store(StoreOrganizationRequest $request, CreateOrganization $action): JsonResponse
    {
        $organization = $action->handle($request->user(), $request->validated());

        return (new OrganizationResource($organization))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateOrganizationRequest $request, Organization $organization): OrganizationResource
    {
        $this->authorize('update', $organization);

        $organization->update($request->validated());

        return new OrganizationResource($organization);
    }
}

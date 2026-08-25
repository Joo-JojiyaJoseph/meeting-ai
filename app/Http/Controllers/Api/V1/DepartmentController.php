<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Departments\StoreDepartmentRequest;
use App\Http\Requests\Departments\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class DepartmentController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Department::class);

        return DepartmentResource::collection(
            Department::with('head')->orderBy('name')->get()
        );
    }

    public function store(StoreDepartmentRequest $request): DepartmentResource
    {
        $this->authorize('create', Department::class);

        $data = $request->validated();
        $department = Department::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(4)),
            'description' => $data['description'] ?? null,
            'head_user_id' => $this->resolveUser($data['head_user_id'] ?? null),
        ]);

        return new DepartmentResource($department);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): DepartmentResource
    {
        $this->authorize('update', $department);

        $data = $request->validated();
        if (array_key_exists('head_user_id', $data)) {
            $data['head_user_id'] = $this->resolveUser($data['head_user_id']);
        }

        $department->update($data);

        return new DepartmentResource($department);
    }

    public function destroy(Department $department): JsonResponse
    {
        $this->authorize('delete', $department);
        $department->delete();

        return response()->json(['message' => 'Department deleted.']);
    }

    protected function resolveUser(?string $ulid): ?int
    {
        return $ulid ? User::where('ulid', $ulid)->value('id') : null;
    }
}

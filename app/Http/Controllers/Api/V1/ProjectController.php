<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\StoreProjectRequest;
use App\Http\Requests\Projects\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Department;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Project::class);

        $perPage = min(max($request->integer('per_page', 20), 1), 100);

        $projects = Project::query()
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->withCount(['meetings', 'tasks'])
            ->latest()
            ->paginate($perPage);

        return ProjectResource::collection($projects);
    }

    public function store(StoreProjectRequest $request): ProjectResource
    {
        $this->authorize('create', Project::class);

        $data = $request->validated();
        $project = Project::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(4)),
            'code' => $data['code'] ?? null,
            'description' => $data['description'] ?? null,
            'color' => $data['color'] ?? null,
            'department_id' => $this->resolve(Department::class, $data['department_id'] ?? null),
            'owner_id' => $this->resolve(User::class, $data['owner_id'] ?? null),
            'starts_on' => $data['starts_on'] ?? null,
            'ends_on' => $data['ends_on'] ?? null,
        ]);

        return new ProjectResource($project);
    }

    public function show(Project $project): ProjectResource
    {
        $this->authorize('view', $project);

        return new ProjectResource($project->load(['department', 'owner'])->loadCount(['meetings', 'tasks']));
    }

    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        $this->authorize('update', $project);

        $data = $request->validated();
        if (array_key_exists('department_id', $data)) {
            $data['department_id'] = $this->resolve(Department::class, $data['department_id']);
        }
        if (array_key_exists('owner_id', $data)) {
            $data['owner_id'] = $this->resolve(User::class, $data['owner_id']);
        }

        $project->update($data);

        return new ProjectResource($project);
    }

    public function destroy(Project $project): \Illuminate\Http\JsonResponse
    {
        $this->authorize('delete', $project);
        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
    }

    protected function resolve(string $modelClass, ?string $ulid): ?int
    {
        return $ulid ? $modelClass::where('ulid', $ulid)->value('id') : null;
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tasks\StoreTaskRequest;
use App\Http\Requests\Tasks\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Meeting;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Task::class);

        $tasks = Task::query()
            ->with(['assignee', 'project', 'meeting'])
            ->withCount('comments')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('priority'), fn ($q) => $q->where('priority', $request->priority))
            ->when($request->boolean('mine'), fn ($q) => $q->where('assignee_id', $request->user()->id))
            ->when($request->boolean('overdue'), fn ($q) => $q->overdue())
            ->when($request->filled('assignee_id'), fn ($q) => $q->whereHas('assignee', fn ($u) => $u->where('ulid', $request->assignee_id)))
            ->when($request->filled('project_id'), fn ($q) => $q->whereHas('project', fn ($p) => $p->where('ulid', $request->project_id)))
            ->orderByRaw("CASE status WHEN 'blocked' THEN 0 WHEN 'in_progress' THEN 1 WHEN 'pending' THEN 2 ELSE 3 END")
            ->orderBy('due_date')
            ->paginate(25)
            ->withQueryString();

        return TaskResource::collection($tasks);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $this->authorize('create', Task::class);

        $data = $request->validated();
        $task = Task::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'assignee_id' => $this->resolve(User::class, $data['assignee_id'] ?? null),
            'project_id' => $this->resolve(Project::class, $data['project_id'] ?? null),
            'meeting_id' => $this->resolve(Meeting::class, $data['meeting_id'] ?? null),
            'created_by' => $request->user()->id,
            'priority' => $data['priority'] ?? 'medium',
            'due_date' => $data['due_date'] ?? null,
            'status' => TaskStatus::Pending->value,
        ]);

        return (new TaskResource($task->load('assignee')))->response()->setStatusCode(201);
    }

    public function show(Task $task): TaskResource
    {
        $this->authorize('view', $task);

        return new TaskResource($task->load(['assignee', 'creator', 'project', 'meeting'])->loadCount('comments'));
    }

    public function update(UpdateTaskRequest $request, Task $task): TaskResource
    {
        $this->authorize('update', $task);

        $data = $request->validated();
        if (array_key_exists('assignee_id', $data)) {
            $this->authorize('assign', $task);
            $data['assignee_id'] = $this->resolve(User::class, $data['assignee_id']);
        }
        // Stamp completion time when moving to completed.
        if (($data['status'] ?? null) === TaskStatus::Completed->value && $task->status !== TaskStatus::Completed) {
            $data['completed_at'] = now();
        }

        $task->update($data);

        return new TaskResource($task->fresh(['assignee']));
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);
        $task->delete();

        return response()->json(['message' => 'Task deleted.']);
    }

    protected function resolve(string $modelClass, ?string $ulid): ?int
    {
        return $ulid ? $modelClass::where('ulid', $ulid)->value('id') : null;
    }
}

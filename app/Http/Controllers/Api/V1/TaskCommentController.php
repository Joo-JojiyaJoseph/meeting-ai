<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tasks\StoreTaskCommentRequest;
use App\Http\Resources\TaskCommentResource;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskCommentController extends Controller
{
    public function index(Task $task): AnonymousResourceCollection
    {
        $this->authorize('view', $task);

        return TaskCommentResource::collection(
            $task->comments()->with('user')->latest()->get()
        );
    }

    public function store(StoreTaskCommentRequest $request, Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->body,
        ]);

        return (new TaskCommentResource($comment->load('user')))->response()->setStatusCode(201);
    }

    public function destroy(Task $task, int $comment): JsonResponse
    {
        $this->authorize('view', $task);

        $model = $task->comments()->whereKey($comment)->firstOrFail();
        abort_unless($model->user_id === request()->user()->id, 403);
        $model->delete();

        return response()->json(['message' => 'Comment deleted.']);
    }
}

<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Models\Meeting;
use App\Models\Organization;
use App\Services\AI\AiClient;
use App\Support\OrganizationContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

/**
 * Base for every pipeline stage.
 *
 * Jobs carry the meeting *id* (not the model) to avoid global-scope surprises on
 * unserialize. handle() re-loads the meeting without scopes, establishes the
 * organization context (so tenant-scoped writes like embeddings resolve), sets
 * the stage status for the live UI, then runs the concrete step. A failure at
 * any stage flips the meeting to FAILED and stops the chain.
 */
abstract class PipelineJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public int $meetingId) {}

    abstract protected function status(): AiProcessingStatus;

    abstract protected function process(Meeting $meeting, AiClient $ai): void;

    public function handle(AiClient $ai, OrganizationContext $context): void
    {
        $meeting = Meeting::withoutGlobalScopes()->findOrFail($this->meetingId);
        $organization = Organization::withoutGlobalScopes()->findOrFail($meeting->organization_id);

        $context->run($organization, function () use ($meeting, $ai) {
            $meeting->update(['ai_processing_status' => $this->status()]);
            $this->process($meeting, $ai);
        });
    }

    public function failed(?Throwable $e): void
    {
        Meeting::withoutGlobalScopes()
            ->whereKey($this->meetingId)
            ->update(['ai_processing_status' => AiProcessingStatus::Failed->value]);
    }
}

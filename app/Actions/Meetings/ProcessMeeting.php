<?php

namespace App\Actions\Meetings;

use App\Enums\AiProcessingStatus;
use App\Jobs\Pipeline\AnalyzeAgendaCoverageJob;
use App\Jobs\Pipeline\EmbedMeetingJob;
use App\Jobs\Pipeline\ExtractActionItemsJob;
use App\Jobs\Pipeline\ExtractDecisionsJob;
use App\Jobs\Pipeline\ExtractRisksQuestionsJob;
use App\Jobs\Pipeline\ExtractTopicsJob;
use App\Jobs\Pipeline\FinalizeMeetingJob;
use App\Jobs\Pipeline\GenerateMomJob;
use App\Jobs\Pipeline\GenerateSummaryJob;
use App\Jobs\Pipeline\TranscribeMeetingJob;
use App\Models\Meeting;
use Illuminate\Support\Facades\Bus;

/**
 * Builds and dispatches the full AI pipeline as a job chain (spec §21, §45).
 * A chain stops on the first failure, and each job flips the meeting to FAILED,
 * so partial processing is visible and resumable rather than silently broken.
 */
class ProcessMeeting
{
    public function handle(Meeting $meeting): void
    {
        if (! $meeting->ai_processing_enabled || ! $meeting->organization->ai_processing_enabled) {
            return; // respect per-meeting and per-org AI toggles (§41)
        }

        $meeting->update(['ai_processing_status' => AiProcessingStatus::Queued]);

        $id = $meeting->id;

        Bus::chain([
            new TranscribeMeetingJob($id),
            new ExtractTopicsJob($id),
            new GenerateSummaryJob($id),
            new ExtractDecisionsJob($id),
            new ExtractActionItemsJob($id),
            new ExtractRisksQuestionsJob($id),
            new AnalyzeAgendaCoverageJob($id),
            new GenerateMomJob($id),
            new EmbedMeetingJob($id),
            new FinalizeMeetingJob($id),
        ])->onQueue(config('ai.queue', 'ai'))->dispatch();
    }
}

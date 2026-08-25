<?php

namespace App\Jobs\Pipeline;

use App\Enums\AiProcessingStatus;
use App\Models\Meeting;
use App\Models\MeetingSpeaker;
use App\Models\MeetingTranscript;
use App\Services\AI\AiClient;
use Illuminate\Support\Facades\DB;

/**
 * Speech-to-text + diarization + language detection, persisted as a transcript
 * with segments and speakers. Idempotent: an existing transcript is replaced.
 */
class TranscribeMeetingJob extends PipelineJob
{
    protected function status(): AiProcessingStatus
    {
        return AiProcessingStatus::Transcribing;
    }

    protected function process(Meeting $meeting, AiClient $ai): void
    {
        $artifact = $meeting->artifacts()
            ->whereIn('type', ['recording', 'audio', 'transcript'])
            ->latest()
            ->firstOrFail();

        $result = $ai->transcribe([
            'meeting_id' => $meeting->ulid,
            'audio_url' => $artifact->drive_url ?? $artifact->storage_path,
            'mime_type' => $artifact->mime_type,
            'primary_language' => $meeting->primary_language,
            'language_hints' => $meeting->languages ?? [],
            'enable_diarization' => true,
        ]);

        DB::transaction(function () use ($meeting, $result) {
            // Replace any prior transcript (idempotent reprocessing).
            $meeting->segments()->delete();
            $meeting->transcript()->delete();
            $meeting->speakers()->delete();

            $transcript = MeetingTranscript::create([
                'meeting_id' => $meeting->id,
                'primary_language' => $result['primary_language'] ?? $meeting->primary_language,
                'detected_languages' => $result['detected_languages'] ?? [],
                'word_count' => $result['word_count'] ?? 0,
                'provider' => $result['provider'] ?? null,
                'status' => 'completed',
            ]);

            $speakerIds = [];   // label => MeetingSpeaker id
            foreach ($result['segments'] ?? [] as $seg) {
                $label = $seg['speaker_label'] ?? null;
                $speakerId = null;

                if ($label) {
                    $speakerId = $speakerIds[$label]
                        ??= MeetingSpeaker::firstOrCreate(
                            ['meeting_id' => $meeting->id, 'label' => $label],
                        )->id;
                }

                $transcript->segments()->create([
                    'meeting_id' => $meeting->id,
                    'speaker_id' => $speakerId,
                    'sequence' => $seg['index'],
                    'start_ms' => $seg['start_ms'],
                    'end_ms' => $seg['end_ms'],
                    'language' => $seg['language'] ?? null,
                    'text' => $seg['text'],
                    'confidence' => $seg['confidence'] ?? null,
                ]);
            }

            // Refresh per-speaker aggregates for participation metrics (§37).
            foreach ($speakerIds as $label => $id) {
                $speaking = $meeting->segments()->where('speaker_id', $id)
                    ->selectRaw('COALESCE(SUM(end_ms - start_ms),0) as ms, COUNT(*) as c')->first();
                MeetingSpeaker::whereKey($id)->update([
                    'total_speaking_seconds' => (int) (($speaking->ms ?? 0) / 1000),
                    'segment_count' => (int) ($speaking->c ?? 0),
                ]);
            }
        });
    }
}

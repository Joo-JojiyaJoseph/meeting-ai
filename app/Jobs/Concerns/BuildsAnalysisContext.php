<?php

namespace App\Jobs\Concerns;

use App\Models\Meeting;

/**
 * Builds the AnalysisContext payload the AI service expects, straight from the
 * persisted transcript. Segments are the grounding anchor — the AI service
 * rejects any extraction citing a timestamp outside these segments.
 */
trait BuildsAnalysisContext
{
    protected function analysisContext(Meeting $meeting): array
    {
        $segments = $meeting->segments()
            ->orderBy('start_ms')
            ->get()
            ->map(fn ($s) => [
                'index' => $s->sequence,
                'speaker' => $s->speaker?->label,
                'start_ms' => (int) $s->start_ms,
                'end_ms' => (int) $s->end_ms,
                'text' => $s->text,
            ])
            ->all();

        $participants = $meeting->participants()
            ->with('user')
            ->get()
            ->map(fn ($p) => $p->user?->name ?? $p->guest_name)
            ->filter()
            ->values()
            ->all();

        return [
            'context' => [
                'meeting_id' => $meeting->ulid,
                'output_language' => $meeting->primary_language ?? 'en',
                'title' => $meeting->title,
                'objective' => $meeting->objective,
                'agenda' => $meeting->agendaItems()->orderBy('position')->pluck('title')->all(),
                'participants' => $participants,
                'segments' => $segments,
            ],
        ];
    }
}

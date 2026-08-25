<?php

namespace App\Enums;

/** The meeting-level pipeline lifecycle shown in the UI (spec §22, §58). */
enum AiProcessingStatus: string
{
    case Pending = 'pending';
    case Uploaded = 'uploaded';
    case Queued = 'queued';
    case Transcribing = 'transcribing';
    case IdentifyingSpeakers = 'identifying_speakers';
    case Translating = 'translating';
    case Analyzing = 'analyzing';
    case GeneratingSummary = 'generating_summary';
    case ExtractingActions = 'extracting_actions';
    case GeneratingMom = 'generating_mom';
    case Indexing = 'indexing';
    case Completed = 'completed';
    case Failed = 'failed';

    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Failed], true);
    }

    public function label(): string
    {
        return ucwords(str_replace('_', ' ', $this->value));
    }
}

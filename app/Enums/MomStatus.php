<?php

namespace App\Enums;

/** Minutes-of-Meeting approval workflow (spec §28). */
enum MomStatus: string
{
    case AiGenerated = 'ai_generated';
    case Draft = 'draft';
    case InReview = 'in_review';
    case Approved = 'approved';
    case Published = 'published';

    public function isDistributable(): bool
    {
        return in_array($this, [self::Approved, self::Published], true);
    }
}

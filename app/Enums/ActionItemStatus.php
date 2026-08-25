<?php

namespace App\Enums;

/** AI-extracted action items are staged before becoming real tasks (spec §25). */
enum ActionItemStatus: string
{
    case Suggested = 'suggested';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Converted = 'converted';
}

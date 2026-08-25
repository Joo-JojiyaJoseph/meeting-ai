<?php

namespace App\Enums;

/** Access tier for a meeting and its artifacts (spec §40). */
enum MeetingVisibility: string
{
    case Private = 'private';         // organizer + explicit participants
    case Confidential = 'confidential'; // participants only, excluded from broad AI search
    case Organization = 'organization'; // visible per normal RBAC
}

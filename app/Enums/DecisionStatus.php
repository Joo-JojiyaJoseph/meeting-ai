<?php

namespace App\Enums;

enum DecisionStatus: string
{
    case Proposed = 'proposed';
    case Approved = 'approved';
    case Rejected = 'rejected';
}

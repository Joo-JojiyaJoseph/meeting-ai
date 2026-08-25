<?php

namespace App\Enums;

/** Grounding label for AI-extracted content (spec §52). */
enum AiConfidence: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
}

<?php

namespace App\Actions\Mom;

use App\Jobs\Concerns\BuildsAnalysisContext;
use App\Models\MinutesOfMeeting;
use App\Services\AI\AiClient;

/**
 * Re-runs the AI for a single MoM section and patches it into the content,
 * snapshotting a new version. Lets the organizer refine the draft (§27).
 */
class RegenerateMomSection
{
    use BuildsAnalysisContext;

    public function __construct(protected AiClient $ai) {}

    public function handle(MinutesOfMeeting $mom, string $section): MinutesOfMeeting
    {
        $meeting = $mom->meeting;
        $context = $this->analysisContext($meeting);
        $content = $mom->content ?? [];

        $content[$section] = match ($section) {
            'executive_summary' => $this->ai->summary($context)['executive_summary'] ?? [],
            'next_steps' => $this->ai->summary($context)['next_steps'] ?? [],
            'decisions' => $this->ai->decisions($context)['decisions'] ?? [],
            'action_items' => $this->ai->actionItems($context)['action_items'] ?? [],
            'detailed_discussions' => $this->ai->minutes($context)['minutes']['detailed_discussions'] ?? [],
            default => $content[$section] ?? null,
        };

        $version = $mom->current_version + 1;
        $mom->update(['content' => $content, 'current_version' => $version, 'status' => 'draft']);
        $mom->versions()->create([
            'version' => $version,
            'content' => $content,
            'change_note' => "Regenerated section: {$section}",
        ]);

        return $mom->fresh();
    }
}

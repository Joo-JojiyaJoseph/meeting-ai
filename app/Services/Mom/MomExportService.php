<?php

namespace App\Services\Mom;

use App\Models\MinutesOfMeeting;
use Barryvdh\DomPDF\Facade\Pdf;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Html;

/**
 * Renders an approved MoM to a professional corporate document (spec §29).
 *
 * Requires: composer require barryvdh/laravel-dompdf phpoffice/phpword
 *
 * PDF is rendered from the Blade template resources/views/mom/pdf.blade.php so
 * the layout is easy to restyle. DOCX is built from the same structured content.
 */
class MomExportService
{
    public function pdf(MinutesOfMeeting $mom): string
    {
        $mom->loadMissing('meeting.organizer', 'meeting.participants.user');

        return Pdf::loadView('mom.pdf', [
            'mom' => $mom,
            'meeting' => $mom->meeting,
            'sections' => $mom->content ?? [],
        ])->setPaper('a4')->output();
    }

    public function docx(MinutesOfMeeting $mom): string
    {
        $mom->loadMissing('meeting');
        $content = $mom->content ?? [];

        $word = new PhpWord();
        $word->getSettings()->setThemeFontLang(new \PhpOffice\PhpWord\Style\Language('en-US'));
        $section = $word->addSection();

        $section->addTitle(htmlspecialchars($mom->title), 1);
        $section->addText($mom->meeting?->scheduled_start_at?->format('d M Y H:i') ?? '');
        $section->addTextBreak(1);

        $this->docxList($section, 'Executive Summary', $content['executive_summary'] ?? []);
        $this->docxDiscussions($section, $content['detailed_discussions'] ?? []);
        $this->docxDecisions($section, $content['decisions'] ?? []);
        $this->docxActionItems($section, $content['action_items'] ?? []);
        $this->docxList($section, 'Next Steps', $content['next_steps'] ?? []);

        $tmp = tempnam(sys_get_temp_dir(), 'mom').'.docx';
        \PhpOffice\PhpWord\IOFactory::createWriter($word, 'Word2007')->save($tmp);
        $bytes = file_get_contents($tmp);
        @unlink($tmp);

        return $bytes;
    }

    protected function docxList($section, string $heading, array $items): void
    {
        if (empty($items)) {
            return;
        }
        $section->addTitle($heading, 2);
        foreach ($items as $item) {
            $section->addListItem(is_string($item) ? $item : json_encode($item));
        }
        $section->addTextBreak(1);
    }

    protected function docxDiscussions($section, array $discussions): void
    {
        if (empty($discussions)) {
            return;
        }
        $section->addTitle('Detailed Discussions', 2);
        foreach ($discussions as $d) {
            $section->addText((string) ($d['heading'] ?? ''), ['bold' => true]);
            foreach ($d['points'] ?? [] as $point) {
                $section->addListItem((string) $point);
            }
        }
        $section->addTextBreak(1);
    }

    protected function docxDecisions($section, array $decisions): void
    {
        if (empty($decisions)) {
            return;
        }
        $section->addTitle('Decisions', 2);
        foreach ($decisions as $d) {
            $section->addListItem((string) ($d['decision'] ?? ''));
        }
        $section->addTextBreak(1);
    }

    protected function docxActionItems($section, array $items): void
    {
        if (empty($items)) {
            return;
        }
        $section->addTitle('Action Items', 2);
        foreach ($items as $a) {
            $line = ($a['title'] ?? '');
            if (! empty($a['assignee_name_raw'])) {
                $line .= ' — '.$a['assignee_name_raw'];
            }
            if (! empty($a['due_date'])) {
                $line .= ' (due '.$a['due_date'].')';
            }
            $section->addListItem($line);
        }
        $section->addTextBreak(1);
    }
}

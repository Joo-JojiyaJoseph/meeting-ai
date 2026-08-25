<?php

namespace App\Mail;

use App\Models\MinutesOfMeeting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MinutesOfMeetingMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public MinutesOfMeeting $mom,
        public ?string $note = null,
        public ?string $pdf = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Minutes of Meeting — '.$this->mom->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.mom',
            with: [
                'mom' => $this->mom,
                'meeting' => $this->mom->meeting,
                'note' => $this->note,
                'url' => config('app.frontend_url', config('app.url')).'/meetings/'.$this->mom->meeting?->ulid,
            ],
        );
    }

    public function attachments(): array
    {
        if (! $this->pdf) {
            return [];
        }

        return [
            \Illuminate\Mail\Mailables\Attachment::fromData(fn () => $this->pdf, 'minutes-of-meeting.pdf')
                ->withMime('application/pdf'),
        ];
    }
}

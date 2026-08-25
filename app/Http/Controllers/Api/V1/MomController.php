<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Mom\RegenerateMomSection;
use App\Http\Controllers\Controller;
use App\Http\Requests\Mom\EmailMomRequest;
use App\Http\Requests\Mom\RegenerateSectionRequest;
use App\Http\Requests\Mom\UpdateMomRequest;
use App\Http\Resources\MomResource;
use App\Mail\MinutesOfMeetingMail;
use App\Models\Meeting;
use App\Models\MinutesOfMeeting;
use App\Services\Mom\MomExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * MoM editor + approval workflow + distribution (spec §27–30). The approval
 * gate is enforced here: only approved minutes can be published or emailed.
 */
class MomController extends Controller
{
    protected function mom(Meeting $meeting): MinutesOfMeeting
    {
        return $meeting->minutes()->firstOrFail();
    }

    public function update(UpdateMomRequest $request, Meeting $meeting): MomResource
    {
        $mom = $this->mom($meeting);
        $this->authorize('update', $mom);

        $version = $mom->current_version + 1;
        $mom->update([
            'title' => $request->input('title', $mom->title),
            'content' => $request->input('content'),
            'current_version' => $version,
            'status' => $mom->status->value === 'ai_generated' ? 'draft' : $mom->status->value,
        ]);
        $mom->versions()->create([
            'version' => $version,
            'content' => $request->input('content'),
            'edited_by' => $request->user()->id,
            'change_note' => $request->input('change_note'),
        ]);

        return new MomResource($mom->fresh());
    }

    public function regenerate(RegenerateSectionRequest $request, Meeting $meeting, RegenerateMomSection $action): MomResource
    {
        $mom = $this->mom($meeting);
        $this->authorize('update', $mom);

        return new MomResource($action->handle($mom, $request->string('section')));
    }

    public function approve(Meeting $meeting): JsonResponse
    {
        $mom = $this->mom($meeting);
        $this->authorize('approve', $mom);

        $mom->update([
            'status' => 'approved',
            'approved_by' => request()->user()->id,
            'approved_at' => now(),
        ]);
        $mom->approvals()->create([
            'approver_id' => request()->user()->id,
            'action' => 'approved',
            'version' => $mom->current_version,
        ]);

        return response()->json(['message' => 'Minutes approved.', 'status' => 'approved']);
    }

    public function reject(Meeting $meeting): JsonResponse
    {
        $mom = $this->mom($meeting);
        $this->authorize('approve', $mom);

        $mom->update(['status' => 'draft']);
        $mom->approvals()->create([
            'approver_id' => request()->user()->id,
            'action' => 'requested_changes',
            'version' => $mom->current_version,
        ]);

        return response()->json(['message' => 'Changes requested.', 'status' => 'draft']);
    }

    public function publish(Meeting $meeting): JsonResponse
    {
        $mom = $this->mom($meeting);
        $this->authorize('distribute', $mom);

        abort_unless($mom->status->value === 'approved', 422, 'Minutes must be approved before publishing.');

        $mom->update(['status' => 'published', 'published_at' => now()]);

        return response()->json(['message' => 'Minutes published.', 'status' => 'published']);
    }

    public function exportPdf(Meeting $meeting, MomExportService $export): StreamedResponse
    {
        $mom = $this->mom($meeting);
        $this->authorize('view', $mom);

        return response()->streamDownload(
            fn () => print($export->pdf($mom)),
            'minutes-of-meeting.pdf',
            ['Content-Type' => 'application/pdf'],
        );
    }

    public function exportDocx(Meeting $meeting, MomExportService $export): StreamedResponse
    {
        $mom = $this->mom($meeting);
        $this->authorize('view', $mom);

        return response()->streamDownload(
            fn () => print($export->docx($mom)),
            'minutes-of-meeting.docx',
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        );
    }

    public function email(EmailMomRequest $request, Meeting $meeting, MomExportService $export): JsonResponse
    {
        $mom = $this->mom($meeting);
        $this->authorize('distribute', $mom);

        abort_unless(
            in_array($mom->status->value, ['approved', 'published'], true),
            422,
            'Only approved minutes can be distributed.',
        );

        $recipients = $request->input('recipients')
            ?? $meeting->participants()->with('user')->get()
                ->map(fn ($p) => $p->user?->email ?? $p->guest_email)
                ->filter()->unique()->values()->all();

        $pdf = $request->boolean('attach_pdf') ? $export->pdf($mom) : null;

        Mail::to($recipients)->send(new MinutesOfMeetingMail($mom, $request->input('message'), $pdf));

        return response()->json([
            'message' => 'Minutes emailed.',
            'recipients' => count($recipients),
        ]);
    }
}

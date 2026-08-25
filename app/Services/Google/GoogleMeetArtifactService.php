<?php

namespace App\Services\Google;

use App\Models\GoogleAccount;
use App\Models\Meeting;
use Google\Service\Meet as MeetService;

/**
 * Pulls Meet recordings/transcripts for a finished meeting so they can be fed to
 * the AI pipeline (spec §21 ingestion).
 *
 * IMPORTANT — this is the riskiest external dependency in the system:
 *   - Requires Google Workspace (Business Standard+ / Enterprise) with recording
 *     and transcription enabled by an admin.
 *   - Requires the Google Meet REST API enabled and the meetings.space.readonly
 *     / meetings.recording scopes granted.
 *   - Recordings/transcripts are written to the organizer's Drive; the Meet API
 *     exposes conferenceRecords that link to those Drive files.
 *   - Personal @gmail.com accounts cannot record at all.
 *
 * The exact response mapping below should be verified against a live Workspace
 * account. The manual-upload path (POST /meetings/{id}/artifacts) is the reliable
 * fallback and does not depend on any of the above.
 */
class GoogleMeetArtifactService
{
    public function __construct(protected GoogleClientFactory $factory) {}

    /**
     * Returns a normalized list of artifacts discovered for the meeting:
     *   [ ['type' => 'recording'|'transcript', 'google_file_id' => ..., 'drive_url' => ...], ... ]
     *
     * The caller registers these as meeting_artifacts and fires MeetingArtifactReady.
     */
    public function discover(GoogleAccount $account, Meeting $meeting): array
    {
        if (! $meeting->google_meet_id) {
            return [];
        }

        $meet = new MeetService($this->factory->forAccount($account));
        $found = [];

        // Conference records for this meeting's Meet space. The space name is
        // resolvable from the Meet code/conference id; filtering by the space is
        // the documented approach.
        $records = $meet->conferenceRecords->listConferenceRecords([
            'filter' => sprintf('space.meeting_code="%s"', $meeting->google_meet_id),
        ]);

        foreach ($records->getConferenceRecords() ?? [] as $record) {
            $recordName = $record->getName(); // e.g. "conferenceRecords/{id}"

            foreach ($meet->conferenceRecords_recordings->listConferenceRecordsRecordings($recordName)->getRecordings() ?? [] as $rec) {
                $drive = $rec->getDriveDestination();
                if ($drive) {
                    $found[] = [
                        'type' => 'recording',
                        'google_file_id' => $drive->getFile(),
                        'drive_url' => $drive->getExportUri(),
                    ];
                }
            }

            foreach ($meet->conferenceRecords_transcripts->listConferenceRecordsTranscripts($recordName)->getTranscripts() ?? [] as $t) {
                $docs = $t->getDocsDestination();
                if ($docs) {
                    $found[] = [
                        'type' => 'transcript',
                        'google_file_id' => $docs->getDocument(),
                        'drive_url' => $docs->getExportUri(),
                    ];
                }
            }
        }

        return $found;
    }
}

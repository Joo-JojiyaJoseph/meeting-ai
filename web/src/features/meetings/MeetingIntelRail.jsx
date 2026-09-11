import { Card } from "@/components/ui/Card";
import { ParticipantTiles } from "./ParticipantTiles";
import { SpeakerBreakdownCard } from "./SpeakerBreakdown";
import { AskAboutMeeting } from "./AskAboutMeeting";

export function MeetingIntelRail({ meeting, processed }) {
  return (
    <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
      <Card className="p-4">
        <h3 className="mb-3 font-display text-sm font-semibold text-ink">Participants</h3>
        <ParticipantTiles participants={meeting.participants ?? []} />
      </Card>

      <Card className="p-4">
        <SpeakerBreakdownCard meetingId={meeting.id} enabled={processed} />
      </Card>

      <div className="h-[26rem]">
        <AskAboutMeeting meetingTitle={meeting.title} />
      </div>
    </aside>
  );
}

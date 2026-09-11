import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BarChart3, FileText, Gavel, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatTime } from "@/lib/format";
import { useMeeting } from "./detail-api";
import { MeetEmbed } from "./MeetEmbed";
import { MeetingBriefCard } from "./MeetingBriefCard";

export function MeetingRoomPage() {
  const { id = "" } = useParams();
  const [showBrief, setShowBrief] = useState(false);
  const { data: meeting, isLoading } = useMeeting(id);

  if (isLoading || !meeting) {
    return (
      <div className="flex h-screen flex-col bg-[#0B1220]">
        <div className="h-14 border-b border-white/10" />
        <Skeleton className="m-6 flex-1 rounded-2xl bg-white/10" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#0B1220] text-white">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 backdrop-blur-md">
        <Link
          to={`/meetings/${id}`}
          className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Leave
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold">{meeting.title}</p>
          <p className="truncate text-xs text-white/45">
            {formatDate(meeting.scheduled_start_at)} · {formatTime(meeting.scheduled_start_at)}–{formatTime(meeting.scheduled_end_at)}
            {meeting.project?.name ? ` · ${meeting.project.name}` : ""}
          </p>
        </div>
        <Badge tone="brand">{meeting.status.replace("_", " ")}</Badge>
        <div className="hidden items-center gap-1 sm:flex">
          <button type="button" onClick={() => setShowBrief((v) => !v)} className="focus-ring rounded-xl px-2.5 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
            <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Brief</span>
          </button>
          <Link to={`/meetings/${id}?tab=Brief`} className="focus-ring hidden rounded-xl px-2.5 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white xl:inline-flex">
            <span className="inline-flex items-center gap-1">Full brief</span>
          </Link>
          <Link to={`/meetings/${id}?tab=MoM`} className="focus-ring rounded-xl px-2.5 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
            <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> MoM</span>
          </Link>
          <Link to={`/meetings/${id}?tab=Decisions`} className="focus-ring rounded-xl px-2.5 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
            <span className="inline-flex items-center gap-1"><Gavel className="h-3.5 w-3.5" /> Decisions</span>
          </Link>
          <Link to="/analytics" className="focus-ring rounded-xl px-2.5 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
            <span className="inline-flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> Analytics</span>
          </Link>
        </div>
      </header>
      <main className="relative min-h-0 flex-1">
        <div className={`h-full ${showBrief ? "lg:grid lg:grid-cols-[1fr_22rem]" : ""}`}>
          <MeetEmbed roomId={meeting.id} title={meeting.title} googleMeetUrl={meeting.google?.meet_url} />
          {showBrief && (
            <aside className="absolute inset-x-3 bottom-16 z-20 max-h-[50vh] overflow-y-auto rounded-2xl bg-white text-ink shadow-pop lg:static lg:max-h-none lg:rounded-none lg:bg-canvas">
              <MeetingBriefCard meetingId={id} compact />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Download, Pencil, Play, Share2, Video, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatTime } from "@/lib/format";
import { api } from "@/lib/api";
import { useMeeting, useProcessingStatus } from "./detail-api";
import { AiProcessingStatus } from "./AiProcessingStatus";
import { TranscriptTab } from "./tabs/TranscriptTab";
import { SummaryTab } from "./tabs/SummaryTab";
import { DecisionsTab } from "./tabs/DecisionsTab";
import { ActionItemsTab } from "./tabs/ActionItemsTab";
import { MomTab } from "./tabs/MomTab";
import { MeetingBriefCard } from "./MeetingBriefCard";
import { MeetingIntelRail } from "./MeetingIntelRail";
import { MeetingNotesPanel } from "./MeetingNotesPanel";
import { ShareMeetingModal } from "./ShareMeetingModal";
import { downloadIcs, meetingToIcs } from "@/lib/ics";

const TABS = ["Overview", "Notes", "Brief", "Transcript", "Summary", "Decisions", "Action Items", "MoM"];

export function MeetingDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = TABS.includes(searchParams.get("tab") ?? "") ? searchParams.get("tab") : "Overview";
  const { data: meeting, isLoading, refetch: refetchMeeting } = useMeeting(id);
  const { data: processing, refetch: refetchProcessing } = useProcessingStatus(id);
  const [tab, setTab] = useState(initialTab);
  const [showEdit, setShowEdit] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoading || !meeting) return <div className="mx-auto max-w-6xl space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 rounded-2xl" /></div>;

  const runAction = async (action) => {
    setBusy(true);
    setActionError("");
    try { await action(); await refetchMeeting(); await refetchProcessing(); }
    catch (error) { setActionError(error.response?.data?.message || "The request could not be completed."); }
    finally { setBusy(false); }
  };

  const process = () => runAction(() => api.post(`/v1/meetings/${id}/process`));
  const cancel = () => { if (window.confirm("Cancel this meeting?")) runAction(() => api.post(`/v1/meetings/${id}/cancel`)); };
  const saveEdit = (event) => {
    event.preventDefault();
    runAction(async () => { await api.patch(`/v1/meetings/${id}`, { title: editTitle }); setShowEdit(false); });
  };
  const openEdit = () => { setEditTitle(meeting.title); setShowEdit(true); };

  const processed = meeting.ai_processing_status === "completed" || processing?.status === "completed";
  const roster = meeting.participants ?? [];

  return <div className="mx-auto max-w-7xl space-y-6">
    <Link to="/meetings" className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink"><ArrowLeft className="h-4 w-4" /> Meetings</Link>

    <div className="relative overflow-hidden rounded-2xl border border-line/80 bg-surface shadow-card">
      <div className="h-1.5 w-full bg-ai" />
      <div className="flex flex-wrap items-start justify-between gap-4 p-5">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{meeting.title}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(meeting.scheduled_start_at)} · {formatTime(meeting.scheduled_start_at)}–{formatTime(meeting.scheduled_end_at)}</span>
            <Badge tone="brand">{meeting.status.replace("_", " ")}</Badge>
          </div>
          {roster.length > 0 && (
            <div className="mt-3 flex items-center -space-x-2">
              {roster.slice(0, 5).map((p, i) => (
                <span key={p.id ?? i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-brand-100 text-[11px] font-semibold text-brand-700" title={p.user?.name || p.guest_name}>
                  {(p.user?.name || p.guest_name || "?").trim()[0]?.toUpperCase()}
                </span>
              ))}
              {roster.length > 5 && <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-slate-100 text-[10px] font-semibold text-ink-soft">+{roster.length - 5}</span>}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {meeting.status !== "cancelled" && (meeting.google?.meet_url || meeting.status === "scheduled" || meeting.status === "in_progress") ? <Button variant="secondary" onClick={() => navigate(`/meetings/${id}/join`)}><Video className="h-4 w-4" /> Join Meet</Button> : <Button variant="secondary" disabled><Video className="h-4 w-4" /> No Meet link</Button>}
          {meeting.status !== "cancelled" && <Button variant="ai" onClick={() => setShowShare(true)}><Share2 className="h-4 w-4" /> Share</Button>}
          <Button variant="outline" onClick={() => downloadIcs(`${meeting.title || "meeting"}.ics`, meetingToIcs(meeting))}><Download className="h-4 w-4" /> .ics</Button>
          <Button variant="outline" onClick={openEdit} disabled={busy}><Pencil className="h-4 w-4" /> Edit</Button>
          {meeting.status !== "cancelled" && <Button variant="outline" onClick={cancel} disabled={busy}><X className="h-4 w-4" /> Cancel</Button>}
          {(processing?.status === "pending" || processing?.status === "failed") && <Button variant="ai" onClick={process} disabled={busy}><Play className="h-4 w-4" /> {processing.status === "failed" ? "Retry AI" : "Process with AI"}</Button>}
        </div>
      </div>
    </div>

    {actionError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div>}

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-6">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1">{TABS.map((item) => <button key={item} onClick={() => setTab(item)} className={`focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${tab === item ? "bg-surface text-brand-700 shadow-sm" : "text-ink-soft hover:text-ink"}`}>{item}</button>)}</div>
        {processing && <AiProcessingStatus status={processing} onRetry={process} />}
        {tab === "Overview" && <div className="space-y-5"><div className="rounded-2xl border border-line/80 bg-surface p-5 shadow-card"><h2 className="font-display text-lg font-semibold text-ink">Details</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-ink-soft">Organizer</dt><dd className="font-medium text-ink">{meeting.organizer?.name || "—"}</dd></div><div><dt className="text-sm text-ink-soft">Language</dt><dd className="font-medium text-ink">{meeting.primary_language}</dd></div><div><dt className="text-sm text-ink-soft">Participants</dt><dd className="font-medium text-ink">{meeting.participants_count ?? meeting.participants?.length ?? 0}</dd></div><div><dt className="text-sm text-ink-soft">Project</dt><dd className="font-medium text-ink">{meeting.project?.name || "—"}</dd></div></dl></div><MeetingBriefCard meetingId={id} /></div>}
        {tab === "Brief" && <MeetingBriefCard meetingId={id} />}
        {tab === "Notes" && <MeetingNotesPanel meetingId={id} />}
        {tab === "Transcript" && <TranscriptTab meetingId={id} />}
        {tab === "Summary" && <SummaryTab meetingId={id} />}
        {tab === "Decisions" && <DecisionsTab meetingId={id} />}
        {tab === "Action Items" && <ActionItemsTab meetingId={id} />}
        {tab === "MoM" && <MomTab meetingId={id} />}
      </div>
      <MeetingIntelRail meeting={meeting} processed={processed} />
    </div>

    {showEdit && <div className="modal-scrim"><form onSubmit={saveEdit} className="modal-panel max-w-md"><h2 className="font-display text-xl font-semibold text-ink">Edit meeting</h2><label className="block text-sm font-medium text-ink">Title<input required value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="field mt-1.5" /></label><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowEdit(false)}>Close</Button><Button type="submit" disabled={busy}>Save changes</Button></div></form></div>}
    {showShare && <ShareMeetingModal meeting={meeting} onClose={() => setShowShare(false)} />}
  </div>;
}

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Pencil, Play, Video, X } from "lucide-react";
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

const TABS = ["Overview", "Transcript", "Summary", "Decisions", "Action Items", "MoM"];

export function MeetingDetailPage() {
  const { id = "" } = useParams();
  const { data: meeting, isLoading, refetch: refetchMeeting } = useMeeting(id);
  const { data: processing, refetch: refetchProcessing } = useProcessingStatus(id);
  const [tab, setTab] = useState("Overview");
  const [showEdit, setShowEdit] = useState(false);
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

  return <div className="mx-auto max-w-6xl space-y-6">
    <Link to="/meetings" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"><ArrowLeft className="h-4 w-4" /> Meetings</Link>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="font-display text-2xl font-semibold text-ink">{meeting.title}</h1><div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-ink-soft"><span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(meeting.scheduled_start_at)} · {formatTime(meeting.scheduled_start_at)}–{formatTime(meeting.scheduled_end_at)}</span><Badge tone="brand">{meeting.status.replace("_", " ")}</Badge></div></div>
      <div className="flex flex-wrap gap-2">
        {meeting.google?.meet_url ? <Button variant="secondary" onClick={() => window.open(meeting.google.meet_url, "_blank")}><Video className="h-4 w-4" /> Join Meet</Button> : <Button variant="secondary" disabled><Video className="h-4 w-4" /> No Meet link</Button>}
        <Button variant="secondary" onClick={openEdit} disabled={busy}><Pencil className="h-4 w-4" /> Edit</Button>
        {meeting.status !== "cancelled" && <Button variant="secondary" onClick={cancel} disabled={busy}><X className="h-4 w-4" /> Cancel</Button>}
        {(processing?.status === "pending" || processing?.status === "failed") && <Button variant="ai" onClick={process} disabled={busy}><Play className="h-4 w-4" /> {processing.status === "failed" ? "Retry AI" : "Process with AI"}</Button>}
      </div>
    </div>
    {actionError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div>}
    <div className="flex gap-1 overflow-x-auto border-b border-line">{TABS.map((item) => <button key={item} onClick={() => setTab(item)} className={`focus-ring whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${tab === item ? "border-brand-500 text-brand-700" : "border-transparent text-ink-soft hover:text-ink"}`}>{item}</button>)}</div>
    {processing && <AiProcessingStatus status={processing} onRetry={process} />}
    {tab === "Overview" && <div className="rounded-2xl border border-line bg-surface p-5 shadow-card"><h2 className="font-display text-lg font-semibold text-ink">Details</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-ink-soft">Organizer</dt><dd className="text-ink">{meeting.organizer?.name || "—"}</dd></div><div><dt className="text-sm text-ink-soft">Language</dt><dd className="text-ink">{meeting.primary_language}</dd></div><div><dt className="text-sm text-ink-soft">Participants</dt><dd className="text-ink">{meeting.participants_count ?? meeting.participants?.length ?? 0}</dd></div><div><dt className="text-sm text-ink-soft">Project</dt><dd className="text-ink">{meeting.project?.name || "—"}</dd></div></dl></div>}
    {tab === "Transcript" && <TranscriptTab meetingId={id} />}
    {tab === "Summary" && <SummaryTab meetingId={id} />}
    {tab === "Decisions" && <DecisionsTab meetingId={id} />}
    {tab === "Action Items" && <ActionItemsTab meetingId={id} />}
    {tab === "MoM" && <MomTab meetingId={id} />}
    {showEdit && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4"><form onSubmit={saveEdit} className="w-full max-w-md space-y-5 rounded-2xl bg-surface p-6 shadow-pop"><h2 className="font-display text-xl font-semibold text-ink">Edit meeting</h2><label className="block text-sm font-medium text-ink">Title<input required value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-line px-3 font-normal" /></label><div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setShowEdit(false)}>Close</Button><Button type="submit" disabled={busy}>Save changes</Button></div></form></div>}
  </div>;
}

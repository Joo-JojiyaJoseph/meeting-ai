import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Plus, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/format";
import { useMeetings } from "./api";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const statusTone = { draft: "neutral", scheduled: "brand", in_progress: "info", completed: "success", cancelled: "neutral" };
const emptyForm = { title: "", timezone: "UTC", scheduled_start_at: "", scheduled_end_at: "" };

export function MeetingsPage() {
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { data, isLoading } = useMeetings(status ? { status } : {});

  const openCreate = () => { setCreateError(""); setShowCreate(true); };
  const updateForm = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submitCreate = async (event) => {
    event.preventDefault();
    setIsCreating(true);
    setCreateError("");
    try {
      await api.post("/v1/meetings", { ...form, status: "scheduled", visibility: "organization", primary_language: "en", languages: ["en"], create_google_meet: false });
      setForm(emptyForm);
      setShowCreate(false);
      window.location.reload();
    } catch (error) {
      const errors = error.response?.data?.errors;
      setCreateError(errors ? Object.values(errors).flat().join(" ") : "Unable to create the meeting.");
    } finally { setIsCreating(false); }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="font-display text-2xl font-semibold text-ink">Meetings</h1><p className="mt-1 text-sm text-ink-soft">Schedule, review, and let AI handle the rest.</p></div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New meeting</Button>
      </div>
      <div className="flex flex-wrap gap-2">{FILTERS.map((filter) => <button key={filter.value} onClick={() => setStatus(filter.value)} className={`focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${status === filter.value ? "border-brand-200 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-soft hover:text-ink"}`}>{filter.label}</button>)}</div>
      {isLoading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-2xl" />)}</div> : data?.data?.length > 0 ? <div className="space-y-3">{data.data.map((meeting) => <Card key={meeting.id} className="flex flex-wrap items-center gap-4 p-4"><Link to={`/meetings/${meeting.id}`} className="min-w-0 flex-1"><p className="truncate font-medium text-ink hover:text-brand-700">{meeting.title}</p><p className="mt-0.5 text-sm text-ink-soft">{formatDate(meeting.scheduled_start_at)} · {formatTime(meeting.scheduled_start_at)}{meeting.project ? ` · ${meeting.project.name}` : ""}</p></Link><Badge tone={statusTone[meeting.status]}>{meeting.status.replace("_", " ")}</Badge>{meeting.google?.meet_url && <Button variant="secondary" size="sm" onClick={() => window.open(meeting.google.meet_url, "_blank")}><Video className="h-4 w-4" /> Join</Button>}</Card>)}</div> : <EmptyState icon={CalendarDays} title="No meetings yet" description="Schedule your first Google Meet and let AI generate the intelligence automatically." action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Schedule meeting</Button>} />}
      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4"><form onSubmit={submitCreate} className="w-full max-w-lg space-y-5 rounded-2xl bg-surface p-6 shadow-pop"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-semibold text-ink">Schedule meeting</h2><button type="button" onClick={() => setShowCreate(false)} className="text-sm text-ink-soft hover:text-ink">Cancel</button></div><label className="block text-sm font-medium text-ink">Title<input required value={form.title} onChange={updateForm("title")} className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-line px-3 font-normal" placeholder="Weekly product sync" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-ink">Starts<input required type="datetime-local" value={form.scheduled_start_at} onChange={updateForm("scheduled_start_at")} className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-line px-3 font-normal" /></label><label className="block text-sm font-medium text-ink">Ends<input required type="datetime-local" value={form.scheduled_end_at} onChange={updateForm("scheduled_end_at")} className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-line px-3 font-normal" /></label></div><label className="block text-sm font-medium text-ink">Timezone<input required value={form.timezone} onChange={updateForm("timezone")} className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-line px-3 font-normal" /></label>{createError && <p className="text-sm text-rose-600">{createError}</p>}<Button type="submit" disabled={isCreating} className="w-full">{isCreating ? "Scheduling..." : "Schedule meeting"}</Button></form></div>}
    </div>
  );
}

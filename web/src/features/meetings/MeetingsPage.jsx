import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, Plus, Video } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyCalendarIllustration } from "@/components/illustrations/EmptyIllustrations";
import { formatDate, formatTime } from "@/lib/format";
import { useMeetings } from "./api";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const statusTone = { draft: "neutral", scheduled: "brand", in_progress: "info", completed: "success", cancelled: "neutral" };

function canJoin(meeting) {
  return meeting.status !== "cancelled" && (meeting.google?.meet_url || meeting.status === "scheduled" || meeting.status === "in_progress");
}

export function MeetingsPage() {
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const { data, isLoading } = useMeetings(status ? { status } : {});

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Meetings</h1>
          <p className="mt-1 text-sm text-ink-soft">Create a project, pick members, then join the call in this window.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/calendar")}>Calendar</Button>
          <Button onClick={() => navigate("/meetings/new")}><Plus className="h-4 w-4" /> New meeting</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatus(filter.value)}
            className={`focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${status === filter.value ? "border-brand-200 bg-brand-50 text-brand-700 shadow-sm" : "border-line bg-surface text-ink-soft hover:border-brand-100 hover:text-ink"}`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-2xl" />)}</div>
      ) : data?.data?.length > 0 ? (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        >
          {data.data.map((meeting) => (
            <motion.div
              key={meeting.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.25 }}
            >
              <Card className="flex flex-wrap items-center gap-4 p-4 hover:-translate-y-0.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <Link to={`/meetings/${meeting.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink hover:text-brand-700">{meeting.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {formatDate(meeting.scheduled_start_at)} · {formatTime(meeting.scheduled_start_at)}
                    {meeting.project ? ` · ${meeting.project.name}` : ""}
                  </p>
                </Link>
                <Badge tone={statusTone[meeting.status]}>{meeting.status.replace("_", " ")}</Badge>
                {canJoin(meeting) && (
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/meetings/${meeting.id}/join`)}>
                    <Video className="h-4 w-4" /> Join
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState
          illustration={EmptyCalendarIllustration}
          title="No meetings yet"
          description="Start with a project and members, then schedule a Google Meet that opens inside this app."
          action={<Button onClick={() => navigate("/meetings/new")}><Plus className="h-4 w-4" /> Schedule meeting</Button>}
        />
      )}
    </div>
  );
}

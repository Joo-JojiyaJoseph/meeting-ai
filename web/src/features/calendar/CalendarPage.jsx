import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Download, Plus, Video } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatTime } from "@/lib/format";
import { useMeetings } from "@/features/meetings/api";
import { downloadIcs, meetingsToIcs } from "@/lib/ics";
import {
  WEEKDAY_LABELS,
  addMonths,
  isoDate,
  meetingsOnDay,
  monthGrid,
  rangeParams,
  sameDay,
  startOfDay,
  toLocalInput,
  weekDays,
} from "@/lib/calendar";

const statusTone = { draft: "neutral", scheduled: "brand", in_progress: "info", completed: "success", cancelled: "neutral" };

function unwrapMeetings(payload) {
  return payload?.data ?? payload ?? [];
}

function MeetingChip({ meeting, onOpen }) {
  return (
    <button
      type="button"
      onClick={(event) => { event.stopPropagation(); onOpen(meeting); }}
      className="w-full truncate rounded-md bg-brand-50 px-1.5 py-0.5 text-left text-[11px] font-medium text-brand-700 hover:bg-brand-100"
      title={meeting.title}
    >
      {formatTime(meeting.scheduled_start_at)} {meeting.title}
    </button>
  );
}

function DayMeetings({ meetings, onJoin, onOpen }) {
  if (!meetings.length) {
    return <p className="text-sm text-ink-soft">No meetings on this day.</p>;
  }
  return (
    <div className="space-y-2">
      {meetings.map((meeting) => (
        <Card key={meeting.id} className="p-3">
          <button type="button" onClick={() => onOpen(meeting)} className="w-full text-left">
            <p className="truncate font-medium text-ink hover:text-brand-700">{meeting.title}</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {formatTime(meeting.scheduled_start_at)}
              {meeting.scheduled_end_at ? `–${formatTime(meeting.scheduled_end_at)}` : ""}
              {meeting.project?.name ? ` · ${meeting.project.name}` : ""}
            </p>
          </button>
          <div className="mt-2 flex items-center gap-2">
            <Badge tone={statusTone[meeting.status] ?? "neutral"}>{String(meeting.status).replace("_", " ")}</Badge>
            {meeting.status !== "cancelled" && (
              <Button variant="secondary" size="sm" onClick={() => onJoin(meeting)}>
                <Video className="h-3.5 w-3.5" /> Join
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export function CalendarPage() {
  const navigate = useNavigate();
  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState("month");

  const days = useMemo(() => (view === "week" ? weekDays(selected) : monthGrid(cursor)), [view, selected, cursor]);
  const params = useMemo(() => rangeParams(days), [days]);
  const { data, isLoading } = useMeetings(params);
  const meetings = unwrapMeetings(data);

  const selectedMeetings = meetingsOnDay(meetings, selected).sort((a, b) => new Date(a.scheduled_start_at) - new Date(b.scheduled_start_at));
  const monthLabel = cursor.toLocaleDateString([], { month: "long", year: "numeric" });
  const weekLabel = `${days[0].toLocaleDateString([], { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" })}`;

  const openMeeting = (meeting) => navigate(`/meetings/${meeting.id}`);
  const joinMeeting = (meeting) => navigate(`/meetings/${meeting.id}/join`);
  const scheduleOn = (date) => {
    const start = new Date(date);
    if (sameDay(date, today)) start.setTime(Date.now());
    else start.setHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    navigate(`/meetings/new?start=${encodeURIComponent(toLocalInput(start))}&end=${encodeURIComponent(toLocalInput(end))}`);
  };

  const exportVisible = () => {
    if (!meetings.length) return;
    downloadIcs(`meetingai-${isoDate(days[0])}.ics`, meetingsToIcs(meetings));
  };

  const shift = (amount) => {
    if (view === "week") {
      const next = new Date(selected);
      next.setDate(next.getDate() + amount * 7);
      setSelected(startOfDay(next));
      setCursor(new Date(next.getFullYear(), next.getMonth(), 1));
      return;
    }
    const next = addMonths(cursor, amount);
    setCursor(next);
    setSelected(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Calendar</h1>
          <p className="mt-1 text-sm text-ink-soft">See scheduled meetings by month or week, then join or add one on any day.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportVisible} disabled={!meetings.length}>
            <Download className="h-4 w-4" /> Export .ics
          </Button>
          <Button onClick={() => scheduleOn(selected)}><Plus className="h-4 w-4" /> New meeting</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => shift(-1)} aria-label="Previous"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(today); }}>Today</Button>
          <Button variant="outline" size="sm" onClick={() => shift(1)} aria-label="Next"><ChevronRight className="h-4 w-4" /></Button>
          <h2 className="ml-2 font-display text-lg font-semibold text-ink">{view === "week" ? weekLabel : monthLabel}</h2>
        </div>
        <div className="flex rounded-xl bg-slate-100/80 p-1">
          {["month", "week"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${view === item ? "bg-surface text-brand-700 shadow-sm" : "text-ink-soft hover:text-ink"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-7 border-b border-line bg-canvas/70">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
                ))}
              </div>
              {isLoading ? (
                <div className={`grid grid-cols-7 ${view === "week" ? "min-h-[22rem]" : ""}`}>
                  {days.map((day) => <Skeleton key={isoDate(day)} className="h-24 rounded-none border-b border-r border-line/70" />)}
                </div>
              ) : (
                <div className="grid grid-cols-7">
                  {days.map((day) => {
                    const items = meetingsOnDay(meetings, day);
                    const inMonth = day.getMonth() === cursor.getMonth();
                    const isToday = sameDay(day, today);
                    const isSelected = sameDay(day, selected);
                    return (
                      <button
                        key={isoDate(day)}
                        type="button"
                        onClick={() => setSelected(startOfDay(day))}
                        onDoubleClick={() => scheduleOn(day)}
                        className={`min-h-[6.5rem] border-b border-r border-line/70 p-1.5 text-left transition ${isSelected ? "bg-brand-50" : "bg-surface hover:bg-canvas"} ${view === "week" ? "min-h-[22rem]" : ""}`}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? "bg-ai text-white" : inMonth || view === "week" ? "text-ink" : "text-ink-soft/50"}`}>
                            {day.getDate()}
                          </span>
                          {items.length > 0 && <span className="text-[10px] font-medium text-brand-700">{items.length}</span>}
                        </div>
                        <div className="space-y-1">
                          {items.slice(0, view === "week" ? 8 : 3).map((meeting) => (
                            <MeetingChip key={meeting.id} meeting={meeting} onOpen={openMeeting} />
                          ))}
                          {items.length > (view === "week" ? 8 : 3) && (
                            <p className="text-[10px] text-ink-soft">+{items.length - (view === "week" ? 8 : 3)} more</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Selected day</p>
                <h3 className="font-display text-lg font-semibold text-ink">
                  {selected.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}
                </h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => scheduleOn(selected)}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="mt-4">
              {isLoading ? <Skeleton className="h-32 rounded-xl" /> : <DayMeetings meetings={selectedMeetings} onJoin={joinMeeting} onOpen={openMeeting} />}
            </div>
          </Card>
          <p className="text-xs text-ink-soft">Double-click a day to schedule. Export downloads an .ics file you can open in Google Calendar, Outlook, or Apple Calendar.</p>
        </div>
      </div>
    </div>
  );
}

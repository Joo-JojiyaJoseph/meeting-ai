import { Link, useNavigate } from "react-router-dom";
import { CalendarClock, CalendarDays, CalendarRange, ListChecks, AlertTriangle, Gavel, Sparkles, Plus, Video } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyCalendarIllustration, AllCaughtUpIllustration } from "@/components/illustrations/EmptyIllustrations";
import { useAuthStore } from "@/stores/auth";
import { greeting, formatTime } from "@/lib/format";
import { useDashboard } from "./api";

function asList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();
  const stats = data?.stats;
  const todaysMeetings = asList(data?.todays_meetings);
  const pendingActions = asList(data?.pending_action_items);
  const cards = [
    { label: "Meetings today", value: stats?.meetings_today ?? 0, icon: CalendarDays, tone: "brand" },
    { label: "Upcoming", value: stats?.upcoming_meetings ?? 0, icon: CalendarClock, tone: "info" },
    { label: "This month", value: stats?.meetings_this_month ?? 0, icon: CalendarRange, tone: "brand" },
    { label: "Pending actions", value: stats?.pending_action_items ?? 0, icon: ListChecks, tone: "info" },
    { label: "Overdue actions", value: stats?.overdue_action_items ?? 0, icon: AlertTriangle, tone: "warning" },
    { label: "Decisions", value: stats?.decisions ?? 0, icon: Gavel, tone: "brand" },
    { label: "AI processed", value: stats?.ai_processed_meetings ?? 0, icon: Sparkles, tone: "info" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="glass-panel-strong relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-accent-400/30 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Workspace</p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{greeting()}, {user?.name?.split(" ")[0] ?? "there"}</h1>
            <p className="mt-1.5 max-w-xl text-sm text-ink-soft">Create a project, pick members, then run the meeting in this window.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate("/calendar")}>Calendar</Button>
            <Button onClick={() => navigate("/meetings/new")}><Plus className="h-4 w-4" /> New meeting</Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : cards.map((c, i) => <StatCard key={c.label} index={i} {...c} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Today's meetings</h2>
          {isLoading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : todaysMeetings.length > 0 ? (
            <div className="space-y-3">
              {todaysMeetings.map((m) => (
                <Card key={m.id} className="flex items-center justify-between gap-3 p-4">
                  <Link to={`/meetings/${m.id}`} className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink hover:text-brand-700">{m.title}</p>
                    <p className="text-sm text-ink-soft">{formatTime(m.scheduled_start_at)} · {m.organizer?.name ?? "—"}</p>
                  </Link>
                  <Badge tone={m.status === "completed" ? "success" : "brand"}>{m.status}</Badge>
                  {m.status !== "cancelled" && (
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/meetings/${m.id}/join`)}>
                      <Video className="h-4 w-4" /> Join
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarDays} illustration={EmptyCalendarIllustration} title="No meetings today" description="Schedule a meeting to open Google Meet in this window." action={<Button size="sm" onClick={() => navigate("/meetings/new")}><Plus className="h-4 w-4" /> New meeting</Button>} />
          )}
        </section>
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Pending action items</h2>
          {isLoading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : pendingActions.length > 0 ? (
            <Card className="divide-y divide-line">
              {pendingActions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{t.title}</p>
                    <p className="text-sm text-ink-soft">{t.assignee ?? "Unassigned"}</p>
                  </div>
                  <Badge tone={t.priority === "high" || t.priority === "urgent" ? "danger" : "neutral"}>{t.priority}</Badge>
                </div>
              ))}
            </Card>
          ) : (
            <EmptyState icon={ListChecks} illustration={AllCaughtUpIllustration} title="Nothing pending" description="You're all caught up." />
          )}
        </section>
      </div>
    </div>
  );
}

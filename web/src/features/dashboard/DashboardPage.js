import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { CalendarClock, CalendarDays, CalendarRange, ListChecks, AlertTriangle, Gavel, Sparkles, } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/stores/auth";
import { greeting, formatTime } from "@/lib/format";
import { useDashboard } from "./api";
export function DashboardPage() {
    const user = useAuthStore((s) => s.user);
    const { data, isLoading } = useDashboard();
    const stats = data?.stats;
    const cards = [
        { label: "Meetings today", value: stats?.meetings_today ?? 0, icon: CalendarDays, tone: "brand" },
        { label: "Upcoming", value: stats?.upcoming_meetings ?? 0, icon: CalendarClock, tone: "info" },
        { label: "This month", value: stats?.meetings_this_month ?? 0, icon: CalendarRange, tone: "brand" },
        { label: "Pending actions", value: stats?.pending_action_items ?? 0, icon: ListChecks, tone: "info" },
        { label: "Overdue actions", value: stats?.overdue_action_items ?? 0, icon: AlertTriangle, tone: "warning" },
        { label: "Decisions", value: stats?.decisions ?? 0, icon: Gavel, tone: "brand" },
        { label: "AI processed", value: stats?.ai_processed_meetings ?? 0, icon: Sparkles, tone: "info" },
    ];
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-8", children: [_jsxs("div", { children: [_jsxs("h1", { className: "font-display text-2xl font-semibold text-ink", children: [greeting(), ", ", user?.name?.split(" ")[0] ?? "there"] }), _jsx("p", { className: "mt-1 text-sm text-ink-soft", children: "Here's what's happening with your meetings today." })] }), _jsx("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4", children: isLoading
                    ? Array.from({ length: 7 }).map((_, i) => _jsx(Skeleton, { className: "h-28 rounded-2xl" }, i))
                    : cards.map((c, i) => _jsx(StatCard, { index: i, ...c }, c.label)) }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsxs("section", { children: [_jsx("h2", { className: "mb-3 font-display text-lg font-semibold text-ink", children: "Today's meetings" }), isLoading ? (_jsx(Skeleton, { className: "h-40 rounded-2xl" })) : data && data.todays_meetings.length > 0 ? (_jsx("div", { className: "space-y-3", children: data.todays_meetings.map((m) => (_jsxs(Card, { className: "flex items-center justify-between p-4", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate font-medium text-ink", children: m.title }), _jsxs("p", { className: "text-sm text-ink-soft", children: [formatTime(m.scheduled_start_at), " \u00B7 ", m.organizer?.name ?? "—"] })] }), _jsx(Badge, { tone: m.status === "completed" ? "success" : "brand", children: m.status })] }, m.id))) })) : (_jsx(EmptyState, { icon: CalendarDays, title: "No meetings today", description: "Scheduled meetings for today will appear here." }))] }), _jsxs("section", { children: [_jsx("h2", { className: "mb-3 font-display text-lg font-semibold text-ink", children: "Pending action items" }), isLoading ? (_jsx(Skeleton, { className: "h-40 rounded-2xl" })) : data && data.pending_action_items.length > 0 ? (_jsx(Card, { className: "divide-y divide-line", children: data.pending_action_items.map((t) => (_jsxs("div", { className: "flex items-center justify-between p-4", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate font-medium text-ink", children: t.title }), _jsx("p", { className: "text-sm text-ink-soft", children: t.assignee ?? "Unassigned" })] }), _jsx(Badge, { tone: t.priority === "high" || t.priority === "urgent" ? "danger" : "neutral", children: t.priority })] }, t.id))) })) : (_jsx(EmptyState, { icon: ListChecks, title: "Nothing pending", description: "You're all caught up." }))] })] })] }));
}

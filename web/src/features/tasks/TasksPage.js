import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { CheckSquare, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTasks, useUpdateTaskStatus } from "./api";
const FILTERS = [
    { label: "All open", params: {} },
    { label: "Mine", params: { mine: "1" } },
    { label: "Overdue", params: { overdue: "1" } },
    { label: "Completed", params: { status: "completed" } },
];
const priorityTone = { urgent: "danger", high: "danger", medium: "warning", low: "neutral" };
export function TasksPage() {
    const [filter, setFilter] = useState(0);
    const { data, isLoading } = useTasks(FILTERS[filter].params);
    const update = useUpdateTaskStatus();
    return (_jsxs("div", { className: "mx-auto max-w-5xl space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-display text-2xl font-semibold text-ink", children: "Tasks" }), _jsx("p", { className: "mt-1 text-sm text-ink-soft", children: "Action items, tracked to completion." })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: FILTERS.map((f, i) => (_jsx("button", { onClick: () => setFilter(i), className: `focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${filter === i ? "border-brand-200 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-soft hover:text-ink"}`, children: f.label }, f.label))) }), isLoading ? (_jsx("div", { className: "space-y-3", children: Array.from({ length: 5 }).map((_, i) => _jsx(Skeleton, { className: "h-16 rounded-2xl" }, i)) })) : data && data.data.length > 0 ? (_jsx(Card, { className: "divide-y divide-line", children: data.data.map((t) => (_jsxs("div", { className: "flex items-center gap-3 p-4", children: [_jsx("button", { onClick: () => update.mutate({ id: t.id, status: t.status === "completed" ? "pending" : "completed" }), className: `focus-ring flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${t.status === "completed" ? "border-brand-500 bg-brand-500 text-white" : "border-line hover:border-brand-400"}`, "aria-label": "Toggle complete", children: t.status === "completed" && _jsx(Check, { className: "h-3.5 w-3.5" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: `truncate font-medium ${t.status === "completed" ? "text-ink-soft line-through" : "text-ink"}`, children: t.title }), _jsxs("p", { className: "text-sm text-ink-soft", children: [t.assignee?.name ?? "Unassigned", t.due_date && ` · due ${t.due_date}`, t.meeting && ` · ${t.meeting.title}`] })] }), t.is_overdue && _jsx(Badge, { tone: "danger", children: "overdue" }), _jsx(Badge, { tone: priorityTone[t.priority], children: t.priority })] }, t.id))) })) : (_jsx(EmptyState, { icon: CheckSquare, title: "No tasks here", description: "Accept action items from a meeting to create tasks." }))] }));
}

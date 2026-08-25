import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useActionItems } from "../detail-api";
import { useAcceptActionItem, useRejectActionItem } from "@/features/tasks/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { SourceRef } from "@/components/ui/SourceRef";
import { CheckSquare, Check, X } from "lucide-react";
const priorityTone = { urgent: "danger", high: "danger", medium: "warning", low: "neutral" };
export function ActionItemsTab({ meetingId }) {
    const { data, isLoading } = useActionItems(meetingId, true);
    const accept = useAcceptActionItem(meetingId);
    const reject = useRejectActionItem(meetingId);
    if (isLoading)
        return _jsx(Skeleton, { className: "h-64 rounded-2xl" });
    if (!data || data.data.length === 0)
        return _jsx(EmptyState, { icon: CheckSquare, title: "No action items", description: "Extracted tasks appear here for review." });
    return (_jsx("div", { className: "space-y-3", children: data.data.map((a) => {
            const isSuggested = a.status === "suggested";
            return (_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "font-medium text-ink", children: a.title }), _jsxs("p", { className: "mt-0.5 text-sm text-ink-soft", children: [a.assignee_name_raw ?? "Unassigned", a.due_date && ` · due ${a.due_date}`, a.due_date && a.due_date_confidence === "low" && (_jsx("span", { className: "ml-1 text-amber-600", children: "(date uncertain)" }))] })] }), _jsxs("div", { className: "flex shrink-0 flex-col items-end gap-1", children: [_jsx(Badge, { tone: priorityTone[a.priority], children: a.priority }), _jsx(ConfidenceBadge, { level: a.ai_confidence })] })] }), _jsxs("div", { className: "mt-2 flex items-center justify-between", children: [_jsx(SourceRef, { timestampMs: a.source_timestamp_ms }), isSuggested ? (_jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { size: "sm", variant: "ghost", onClick: () => reject.mutate(a), disabled: reject.isPending, children: [_jsx(X, { className: "h-4 w-4" }), " Dismiss"] }), _jsxs(Button, { size: "sm", onClick: () => accept.mutate(a), disabled: accept.isPending, children: [_jsx(Check, { className: "h-4 w-4" }), " Accept as task"] })] })) : (_jsx(Badge, { tone: a.status === "converted" ? "success" : "neutral", children: a.status }))] })] }, a.id));
        }) }));
}

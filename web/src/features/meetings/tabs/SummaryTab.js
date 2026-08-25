import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useSummary } from "../detail-api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SourceRef } from "@/components/ui/SourceRef";
import { Sparkles } from "lucide-react";
export function SummaryTab({ meetingId }) {
    const { data, isLoading } = useSummary(meetingId, true);
    if (isLoading)
        return _jsx(Skeleton, { className: "h-72 rounded-2xl" });
    if (!data?.summary)
        return _jsx(EmptyState, { icon: Sparkles, title: "No summary yet", description: "Generated automatically after processing." });
    const s = data.summary;
    return (_jsxs("div", { className: "space-y-6", children: [s.executive_summary.length > 0 && (_jsxs(Card, { className: "p-5", children: [_jsx("h3", { className: "mb-3 font-display font-semibold text-ink", children: "Executive summary" }), _jsx("ul", { className: "space-y-2", children: s.executive_summary.map((point, i) => (_jsxs("li", { className: "flex gap-2 text-sm text-ink", children: [_jsx("span", { className: "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" }), point] }, i))) })] })), data.risks.length > 0 && (_jsxs(Card, { className: "p-5", children: [_jsx("h3", { className: "mb-3 font-display font-semibold text-ink", children: "Risks" }), _jsx("div", { className: "space-y-3", children: data.risks.map((r) => (_jsxs("div", { className: "rounded-xl border border-line p-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-sm font-medium text-ink", children: r.title }), _jsx(Badge, { tone: r.severity === "high" ? "danger" : r.severity === "medium" ? "warning" : "neutral", children: r.severity })] }), r.description && _jsx("p", { className: "mt-1 text-sm text-ink-soft", children: r.description }), _jsx("div", { className: "mt-1", children: _jsx(SourceRef, { timestampMs: r.source_timestamp_ms }) })] }, r.id))) })] })), data.questions.length > 0 && (_jsxs(Card, { className: "p-5", children: [_jsx("h3", { className: "mb-3 font-display font-semibold text-ink", children: "Open questions" }), _jsx("ul", { className: "space-y-2", children: data.questions.map((q) => (_jsx("li", { className: "text-sm text-ink", children: q.question }, q.id))) })] }))] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMom } from "../detail-api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileText, Check, Send, Download } from "lucide-react";
const statusTone = {
    ai_generated: "brand",
    draft: "neutral",
    in_review: "warning",
    approved: "success",
    published: "success",
};
const apiBase = import.meta.env.VITE_API_URL ?? "http://meeting-ai.test/api";
export function MomTab({ meetingId }) {
    const { data, isLoading } = useMom(meetingId, true);
    const qc = useQueryClient();
    const approve = useMutation({
        mutationFn: async () => api.post(`/v1/meetings/${meetingId}/mom/approve`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["mom", meetingId] }),
    });
    const publish = useMutation({
        mutationFn: async () => api.post(`/v1/meetings/${meetingId}/mom/publish`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["mom", meetingId] }),
    });
    if (isLoading)
        return _jsx(Skeleton, { className: "h-72 rounded-2xl" });
    if (!data)
        return _jsx(EmptyState, { icon: FileText, title: "No minutes yet", description: "AI-drafted minutes appear after processing." });
    const c = (data.content ?? {});
    const tone = statusTone[data.status] ?? "neutral";
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-display text-lg font-semibold text-ink", children: data.title }), _jsx(Badge, { tone: tone, children: data.status.replace("_", " ") })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [data.status !== "approved" && data.status !== "published" && (_jsxs(Button, { size: "sm", onClick: () => approve.mutate(), disabled: approve.isPending, children: [_jsx(Check, { className: "h-4 w-4" }), " Approve"] })), data.status === "approved" && (_jsxs(Button, { size: "sm", onClick: () => publish.mutate(), disabled: publish.isPending, children: [_jsx(Send, { className: "h-4 w-4" }), " Publish"] })), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => window.open(`${apiBase}/v1/meetings/${meetingId}/mom/export/pdf`, "_blank"), children: [_jsx(Download, { className: "h-4 w-4" }), " PDF"] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => window.open(`${apiBase}/v1/meetings/${meetingId}/mom/export/docx`, "_blank"), children: [_jsx(Download, { className: "h-4 w-4" }), " DOCX"] })] })] }), _jsxs(Card, { className: "space-y-5 p-6", children: [Array.isArray(c.executive_summary) && c.executive_summary.length > 0 && (_jsxs("section", { children: [_jsx("h4", { className: "mb-2 font-display font-semibold text-brand-700", children: "Executive Summary" }), _jsx("ul", { className: "space-y-1.5", children: c.executive_summary.map((p, i) => (_jsxs("li", { className: "flex gap-2 text-sm text-ink", children: [_jsx("span", { className: "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" }), p] }, i))) })] })), Array.isArray(c.decisions) && c.decisions.length > 0 && (_jsxs("section", { children: [_jsx("h4", { className: "mb-2 font-display font-semibold text-brand-700", children: "Decisions" }), _jsx("ul", { className: "space-y-1.5", children: c.decisions.map((d, i) => (_jsx("li", { className: "text-sm text-ink", children: d.decision ?? String(d) }, i))) })] })), Array.isArray(c.action_items) && c.action_items.length > 0 && (_jsxs("section", { children: [_jsx("h4", { className: "mb-2 font-display font-semibold text-brand-700", children: "Action Items" }), _jsx("ul", { className: "space-y-1.5", children: c.action_items.map((a, i) => (_jsxs("li", { className: "text-sm text-ink", children: [a.title, a.assignee_name_raw && _jsxs("span", { className: "text-info-600", children: [" \u2014 ", a.assignee_name_raw] }), a.due_date && _jsxs("span", { className: "text-ink-soft", children: [" \u00B7 due ", a.due_date] })] }, i))) })] })), Array.isArray(c.next_steps) && c.next_steps.length > 0 && (_jsxs("section", { children: [_jsx("h4", { className: "mb-2 font-display font-semibold text-brand-700", children: "Next Steps" }), _jsx("ul", { className: "space-y-1.5", children: c.next_steps.map((n, i) => (_jsx("li", { className: "text-sm text-ink", children: n }, i))) })] })), _jsxs("p", { className: "border-t border-line pt-3 text-xs text-ink-soft", children: ["Version ", data.current_version, " \u00B7 A full rich-text MoM editor (\u00A727) can replace this read view next."] })] })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDecisions } from "../detail-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { SourceRef } from "@/components/ui/SourceRef";
import { Gavel, Check, X } from "lucide-react";

const statusTone = { proposed: "warning", approved: "success", rejected: "danger" };

export function DecisionsTab({ meetingId }) {
    const { data, isLoading } = useDecisions(meetingId, true);
    const qc = useQueryClient();
    const invalidate = () => {
        qc.invalidateQueries({ queryKey: ["decisions", meetingId] });
        qc.invalidateQueries({ queryKey: ["decisions"] });
    };
    const approve = useMutation({
        mutationFn: async (id) => api.post(`/v1/meetings/${meetingId}/decisions/${id}/approve`),
        onSuccess: invalidate,
    });
    const reject = useMutation({
        mutationFn: async (id) => api.post(`/v1/meetings/${meetingId}/decisions/${id}/reject`),
        onSuccess: invalidate,
    });

    if (isLoading)
        return _jsx(Skeleton, { className: "h-64 rounded-2xl" });
    if (!data || data.data.length === 0)
        return _jsx(EmptyState, { icon: Gavel, title: "No decisions detected", description: "AI-extracted decisions appear here." });

    return (_jsx("div", { className: "space-y-3", children: data.data.map((d) => {
        const busy = approve.isPending && approve.variables === d.id || reject.isPending && reject.variables === d.id;
        return (_jsxs(Card, { className: "p-4", children: [
            _jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                _jsxs("div", { className: "min-w-0", children: [
                    d.topic && _jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-ink-soft", children: d.topic }),
                    _jsx("p", { className: "mt-0.5 font-medium text-ink", children: d.decision }),
                    d.context && _jsx("p", { className: "mt-1 text-sm text-ink-soft", children: d.context }),
                ] }),
                _jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [
                    _jsx(Badge, { tone: statusTone[d.status] ?? "neutral", children: d.status }),
                    _jsx(ConfidenceBadge, { level: d.ai_confidence }),
                ] }),
            ] }),
            _jsx("div", { className: "mt-2", children: _jsx(SourceRef, { timestampMs: d.source_timestamp_ms }) }),
            d.status === "proposed" && _jsxs("div", { className: "mt-3 flex gap-2 border-t border-line pt-3", children: [
                _jsxs(Button, { size: "sm", disabled: busy, onClick: () => approve.mutate(d.id), children: [_jsx(Check, { className: "h-4 w-4" }), " Approve"] }),
                _jsxs(Button, { variant: "ghost", size: "sm", disabled: busy, onClick: () => reject.mutate(d.id), children: [_jsx(X, { className: "h-4 w-4" }), " Reject"] }),
            ] }),
        ] }, d.id));
    }) }));
}

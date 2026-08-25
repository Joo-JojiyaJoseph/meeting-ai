import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranscript } from "../detail-api";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileText } from "lucide-react";
function stamp(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}
export function TranscriptTab({ meetingId }) {
    const { data, isLoading } = useTranscript(meetingId, true);
    if (isLoading)
        return _jsx(Skeleton, { className: "h-96 rounded-2xl" });
    if (!data || data.data.length === 0)
        return _jsx(EmptyState, { icon: FileText, title: "No transcript yet", description: "It appears once processing finishes." });
    return (_jsx(Card, { className: "divide-y divide-line", children: data.data.map((seg) => (_jsxs("div", { id: `seg-${seg.start_ms}`, className: "flex gap-4 p-4", children: [_jsx("div", { className: "w-16 shrink-0 pt-0.5 text-xs tabular-nums text-ink-soft", children: stamp(seg.start_ms) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("p", { className: "text-sm font-semibold text-ink", children: [seg.speaker ?? "Speaker", seg.language && _jsx("span", { className: "ml-2 text-xs font-normal text-ink-soft", children: seg.language })] }), _jsx("p", { className: "mt-0.5 text-sm text-ink", children: seg.text })] })] }, seg.id))) }));
}

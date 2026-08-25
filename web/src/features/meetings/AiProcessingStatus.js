import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Check, Loader2, Circle, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
const STAGES = [
    { key: "transcript", label: "Transcript" },
    { key: "summary", label: "Summary generated" },
    { key: "decisions", label: "Decisions extracted" },
    { key: "action_items", label: "Action items created" },
    { key: "mom", label: "Minutes of Meeting ready" },
    { key: "indexed", label: "Indexed to knowledge base" },
];
/**
 * The animated processing experience (§58). Reads the live status (polled by the
 * parent) and renders each stage as pending / active / done, with a failure path.
 */
export function AiProcessingStatus({ status, onRetry, }) {
    const failed = status.status === "failed";
    const firstIncomplete = STAGES.findIndex((s) => !status.stages[s.key]);
    return (_jsxs(Card, { className: "overflow-hidden", children: [_jsxs("div", { className: "flex items-center gap-3 border-b border-line bg-ai px-5 py-4 text-white", children: [failed ? (_jsx(AlertTriangle, { className: "h-5 w-5" })) : status.is_terminal ? (_jsx(Check, { className: "h-5 w-5" })) : (_jsx(Loader2, { className: "h-5 w-5 animate-spin" })), _jsxs("div", { children: [_jsx("p", { className: "font-display text-sm font-semibold", children: "AI Meeting Intelligence" }), _jsx("p", { className: "text-xs text-white/80", children: status.label })] })] }), _jsx("div", { className: "space-y-1 p-4", children: STAGES.map((stage, i) => {
                    const done = status.stages[stage.key];
                    const active = !done && !failed && i === firstIncomplete && !status.is_terminal;
                    return (_jsxs(motion.div, { initial: { opacity: 0, x: -6 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.05 }, className: "flex items-center gap-3 rounded-lg px-2 py-1.5", children: [done ? (_jsx(Check, { className: "h-4 w-4 text-emerald-500" })) : active ? (_jsx(Loader2, { className: "h-4 w-4 animate-spin text-brand-500" })) : failed && i === firstIncomplete ? (_jsx(AlertTriangle, { className: "h-4 w-4 text-rose-500" })) : (_jsx(Circle, { className: "h-4 w-4 text-line" })), _jsx("span", { className: done ? "text-sm text-ink" : active ? "text-sm font-medium text-ink" : "text-sm text-ink-soft", children: stage.label })] }, stage.key));
                }) }), failed && onRetry && (_jsx("div", { className: "border-t border-line px-4 py-3", children: _jsx(Button, { variant: "secondary", size: "sm", onClick: onRetry, children: "Retry processing" }) }))] }));
}

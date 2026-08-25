import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, Send, User as UserIcon, Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAsk } from "./api";
function stamp(ms) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}
const SUGGESTIONS = [
    "What were the key decisions last week?",
    "Who is responsible for API testing?",
    "What problems are still unresolved?",
];
export function AssistantPage() {
    const [input, setInput] = useState("");
    const [turns, setTurns] = useState([]);
    const ask = useAsk();
    const submit = (e, override) => {
        e.preventDefault();
        const question = (override ?? input).trim();
        if (!question)
            return;
        setInput("");
        const idx = turns.length;
        setTurns((t) => [...t, { question, pending: true }]);
        ask.mutate({ question }, {
            onSuccess: (answer) => setTurns((t) => t.map((turn, i) => (i === idx ? { ...turn, answer, pending: false } : turn))),
            onError: () => setTurns((t) => t.map((turn, i) => i === idx
                ? {
                    ...turn,
                    pending: false,
                    answer: { answer: "Something went wrong. Please try again.", used_context: false, citations: [] },
                }
                : turn)),
        });
    };
    return (_jsxs("div", { className: "mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2", children: [_jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-ai text-white", children: _jsx(Sparkles, { className: "h-5 w-5" }) }), _jsxs("div", { children: [_jsx("h1", { className: "font-display text-xl font-semibold text-ink", children: "AI Assistant" }), _jsx("p", { className: "text-sm text-ink-soft", children: "Grounded in the meetings you have access to." })] })] }), _jsxs("div", { className: "flex-1 space-y-6 overflow-y-auto pb-4", children: [turns.length === 0 && (_jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-sm text-ink-soft", children: "Try asking:" }), SUGGESTIONS.map((s) => (_jsx("button", { onClick: (e) => submit(e, s), className: "focus-ring block w-full rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm text-ink hover:border-brand-200 hover:bg-brand-50/40", children: s }, s)))] })), turns.map((turn, i) => (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "flex justify-end", children: _jsxs("div", { className: "flex max-w-[80%] items-start gap-2", children: [_jsx("div", { className: "rounded-2xl rounded-tr-sm bg-brand-500 px-4 py-2.5 text-sm text-white", children: turn.question }), _jsx("span", { className: "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700", children: _jsx(UserIcon, { className: "h-4 w-4" }) })] }) }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx("span", { className: "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ai text-white", children: _jsx(Bot, { className: "h-4 w-4" }) }), _jsx("div", { className: "min-w-0 flex-1", children: turn.pending ? (_jsx(motion.div, { className: "inline-flex gap-1 rounded-2xl rounded-tl-sm bg-surface px-4 py-3 shadow-card", initial: { opacity: 0 }, animate: { opacity: 1 }, children: [0, 1, 2].map((d) => (_jsx(motion.span, { className: "h-1.5 w-1.5 rounded-full bg-ink-soft", animate: { opacity: [0.3, 1, 0.3] }, transition: { duration: 1, repeat: Infinity, delay: d * 0.2 } }, d))) })) : (_jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "whitespace-pre-wrap text-sm text-ink", children: turn.answer?.answer }), turn.answer?.citations && turn.answer.citations.length > 0 && (_jsxs("div", { className: "mt-3 space-y-1.5 border-t border-line pt-3", children: [_jsx("p", { className: "text-xs font-medium uppercase tracking-wide text-ink-soft", children: "Sources" }), turn.answer.citations.map((c) => (_jsxs(Link, { to: `/meetings/${c.meeting_id}`, className: "focus-ring flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-canvas", children: [_jsx(Clock, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-info-500" }), _jsxs("span", { className: "min-w-0", children: [_jsx("span", { className: "text-info-600", children: c.source_timestamp_ms !== null ? stamp(c.source_timestamp_ms) : "source" }), _jsx("span", { className: "ml-2 text-ink-soft", children: c.snippet })] })] }, c.chunk_id)))] }))] })) })] })] }, i)))] }), _jsxs("form", { onSubmit: submit, className: "flex gap-2 border-t border-line pt-4", children: [_jsx("input", { value: input, onChange: (e) => setInput(e.target.value), placeholder: "Ask about your meetings\u2026", className: "focus-ring h-11 flex-1 rounded-xl border border-line bg-surface px-4 text-sm" }), _jsx(Button, { type: "submit", variant: "ai", disabled: ask.isPending || !input.trim(), children: _jsx(Send, { className: "h-4 w-4" }) })] })] }));
}

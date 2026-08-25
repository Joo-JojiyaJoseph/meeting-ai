import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock } from "lucide-react";
function ms(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    const h = Math.floor(m / 60);
    const mm = (h > 0 ? m % 60 : m).toString().padStart(2, "0");
    const ss = rem.toString().padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
/** Grounding citation — clicking jumps the transcript to this timestamp (§53). */
export function SourceRef({ timestampMs, onJump, }) {
    if (timestampMs === null)
        return null;
    return (_jsxs("button", { onClick: () => onJump?.(timestampMs), className: "focus-ring inline-flex items-center gap-1 rounded-md text-xs font-medium text-info-500 hover:text-info-600", children: [_jsx(Clock, { className: "h-3 w-3" }), ms(timestampMs)] }));
}

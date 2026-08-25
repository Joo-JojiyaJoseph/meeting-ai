import { jsx as _jsx } from "react/jsx-runtime";
import { clsx } from "clsx";
export function Card({ className, ...props }) {
    return (_jsx("div", { className: clsx("rounded-2xl border border-line bg-surface shadow-card", className), ...props }));
}

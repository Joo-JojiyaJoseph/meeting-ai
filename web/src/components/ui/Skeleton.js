import { jsx as _jsx } from "react/jsx-runtime";
import { clsx } from "clsx";
export function Skeleton({ className }) {
    return _jsx("div", { className: clsx("animate-pulse rounded-lg bg-line/70", className) });
}

import { jsx as _jsx } from "react/jsx-runtime";
import { clsx } from "clsx";
const variants = {
    // Purple primary CTA, blue secondary — per the spec's colour roles.
    primary: "bg-brand-500 text-white hover:bg-brand-600 shadow-sm",
    secondary: "bg-info-500 text-white hover:bg-info-600 shadow-sm",
    ghost: "bg-transparent text-ink-soft hover:bg-canvas hover:text-ink",
    ai: "bg-ai text-white hover:opacity-95 shadow-sm",
};
const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
};
export function Button({ variant = "primary", size = "md", className, ...props }) {
    return (_jsx("button", { className: clsx("focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50", variants[variant], sizes[size], className), ...props }));
}

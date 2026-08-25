import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Construction } from "lucide-react";
import { EmptyState } from "./EmptyState";
/** Stand-in for routes not yet built, so navigation is fully wired. */
export function Placeholder({ title }) {
    return (_jsxs("div", { className: "mx-auto max-w-7xl", children: [_jsx("h1", { className: "mb-6 font-display text-2xl font-semibold text-ink", children: title }), _jsx(EmptyState, { icon: Construction, title: `${title} is coming next`, description: "This area is scaffolded and ready to build on the existing API." })] }));
}

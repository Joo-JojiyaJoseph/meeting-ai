import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search, Bell } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
export function Topbar() {
    const user = useAuthStore((s) => s.user);
    const org = useAuthStore((s) => s.organizations.find((o) => o.id === s.organizationId));
    return (_jsxs("header", { className: "flex h-16 items-center gap-4 border-b border-line bg-surface px-4 lg:px-6", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" }), _jsx("input", { type: "search", placeholder: "Search meetings, people, projects\u2026", className: "focus-ring h-10 w-full rounded-xl border border-line bg-canvas pl-9 pr-3 text-sm placeholder:text-ink-soft" })] }), _jsxs("div", { className: "ml-auto flex items-center gap-3", children: [org && (_jsx("span", { className: "hidden rounded-xl border border-line px-3 py-1.5 text-sm font-medium text-ink-soft sm:block", children: org.name })), _jsx("button", { className: "focus-ring relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-canvas", children: _jsx(Bell, { className: "h-5 w-5" }) }), _jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white", children: user?.name?.[0]?.toUpperCase() ?? "U" })] })] }));
}

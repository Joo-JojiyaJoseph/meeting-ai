import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { clsx } from "clsx";
import { LayoutDashboard, CalendarDays, FolderKanban, CheckSquare, Gavel, Search, Bot, Users, BarChart3, Settings, Sparkles, } from "lucide-react";
const primary = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/meetings", label: "Meetings", icon: CalendarDays },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/tasks", label: "Tasks", icon: CheckSquare },
    { to: "/decisions", label: "Decisions", icon: Gavel },
    { to: "/search", label: "AI Search", icon: Search },
    { to: "/assistant", label: "AI Assistant", icon: Bot },
];
const org = [
    { to: "/members", label: "Members", icon: Users },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
];
function Item({ to, label, icon: Icon }) {
    return (_jsxs(NavLink, { to: to, className: ({ isActive }) => clsx("focus-ring flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors", isActive
            ? "bg-brand-50 text-brand-700"
            : "text-ink-soft hover:bg-canvas hover:text-ink"), children: [_jsx(Icon, { className: "h-[18px] w-[18px]", strokeWidth: 2 }), label] }));
}
export function Sidebar() {
    return (_jsxs("aside", { className: "hidden w-64 shrink-0 flex-col border-r border-line bg-surface px-3 py-4 lg:flex", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 pb-6", children: [_jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-xl bg-ai text-white", children: _jsx(Sparkles, { className: "h-4 w-4" }) }), _jsx("span", { className: "font-display text-lg font-semibold tracking-tight text-ink", children: "MeetingAI" })] }), _jsxs("nav", { className: "flex flex-1 flex-col gap-1", children: [primary.map((i) => (_jsx(Item, { ...i }, i.to))), _jsx("div", { className: "px-3 pb-1 pt-5 text-xs font-semibold uppercase tracking-wider text-ink-soft/70", children: "Organization" }), org.map((i) => (_jsx(Item, { ...i }, i.to)))] }), _jsx("div", { className: "mt-auto border-t border-line pt-3", children: _jsx(Item, { to: "/settings", label: "Settings", icon: Settings }) })] }));
}

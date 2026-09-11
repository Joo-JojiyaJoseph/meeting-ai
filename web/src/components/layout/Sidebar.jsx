import { NavLink } from "react-router-dom";
import { clsx } from "clsx";
import { LayoutDashboard, CalendarDays, CalendarRange, FolderKanban, CheckSquare, Gavel, Search, Bot, Users, BarChart3, Settings, Sparkles } from "lucide-react";

const primary = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meetings", label: "Meetings", icon: CalendarDays },
  { to: "/calendar", label: "Calendar", icon: CalendarRange },
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

function Item({ to, label, icon: Icon, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => clsx(
        "focus-ring group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-ai text-white shadow-sm"
          : "text-ink-soft hover:bg-brand-50 hover:text-brand-700",
      )}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      {label}
    </NavLink>
  );
}

export function SidebarNav({ onNavigate, className }) {
  return (
    <div className={clsx("flex h-full flex-col", className)}>
      <div className="flex items-center gap-2.5 px-3 pb-7">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ai text-white shadow-glow">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="font-display text-lg font-bold tracking-tight text-ink">MeetingAI</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-soft">Intelligence</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {primary.map((item) => <Item key={item.to} {...item} onNavigate={onNavigate} />)}
        <div className="px-3 pb-1 pt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft/70">Organization</div>
        {org.map((item) => <Item key={item.to} {...item} onNavigate={onNavigate} />)}
      </nav>
      <div className="mt-auto border-t border-line/80 pt-3">
        <Item to="/settings" label="Settings" icon={Settings} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line/80 bg-surface/90 px-3 py-5 backdrop-blur-md lg:flex">
      <SidebarNav />
    </aside>
  );
}

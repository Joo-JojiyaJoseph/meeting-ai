import { Menu, Search } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { NotificationBell } from "@/features/notifications/NotificationBell";

export function Topbar({ onMenu }) {
  const user = useAuthStore((s) => s.user);
  const org = useAuthStore((s) => s.organizations.find((o) => o.id === s.organizationId));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line/80 bg-surface/80 px-4 backdrop-blur-xl lg:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-canvas lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
        <input
          type="search"
          placeholder="Search meetings, people, projects…"
          className="focus-ring h-10 w-full rounded-xl border border-line bg-canvas/80 pl-9 pr-3 text-sm placeholder:text-ink-soft"
        />
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        {org && (
          <span className="hidden rounded-xl border border-line bg-canvas/70 px-3 py-1.5 text-sm font-medium text-ink-soft sm:block">
            {org.name}
          </span>
        )}
        <NotificationBell />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ai text-sm font-semibold text-white shadow-sm">
          {user?.name?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import { X } from "lucide-react";
import { Sidebar, SidebarNav } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const { pathname } = useLocation();
  const immersive = Boolean(matchPath("/meetings/:id/join", pathname));
  const [mobileOpen, setMobileOpen] = useState(false);

  if (immersive) {
    return (
      <div className="h-screen overflow-hidden bg-[#0B1220]">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-mesh bg-fixed">
      <Sidebar />
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40 backdrop-blur-sm" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
          <aside className="glass-panel-strong relative ml-3 mt-3 flex h-[calc(100vh-1.5rem)] w-72 flex-col rounded-2xl px-3 py-5">
            <button type="button" onClick={() => setMobileOpen(false)} className="focus-ring absolute right-3 top-5 rounded-lg p-1.5 text-ink-soft hover:bg-white/60" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="page-enter flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

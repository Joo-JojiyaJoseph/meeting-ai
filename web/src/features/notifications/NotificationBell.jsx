import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Sparkles } from "lucide-react";
import { formatRelative } from "@/lib/format";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "./api";

function unwrap(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const seen = useRef(new Set());
  const primed = useRef(false);
  const root = useRef(null);

  const items = unwrap(data);
  const unreadCount = data?.unread_count ?? items.filter((item) => !item.read_at).length;

  useEffect(() => {
    const unread = items.filter((item) => !item.read_at);
    if (!primed.current) {
      unread.forEach((item) => seen.current.add(item.id));
      primed.current = true;
      return;
    }
    const fresh = unread.filter((item) => !seen.current.has(item.id));
    fresh.forEach((item) => seen.current.add(item.id));
    fresh.slice(0, 3).forEach((item) => {
      const toastId = `${item.id}-${Date.now()}`;
      setToasts((current) => [{ ...item, toastId }, ...current].slice(0, 3));
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.toastId !== toastId));
      }, 5000);
    });
  }, [items]);

  useEffect(() => {
    const onClick = (event) => {
      if (root.current && !root.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const openItem = (item) => {
    if (!item.read_at) markRead.mutate(item.id);
    setOpen(false);
    setToasts((current) => current.filter((toast) => toast.id !== item.id));
    if (item.url) navigate(item.url);
  };

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-soft hover:bg-canvas"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[90vw] overflow-hidden rounded-2xl border border-line bg-surface shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-sm font-semibold text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" onClick={() => markAll.mutate()} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-soft">No notifications yet.</p>
            ) : items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openItem(item)}
                className={`block w-full border-b border-line px-4 py-3 text-left last:border-0 hover:bg-canvas ${item.read_at ? "opacity-70" : "bg-brand-50/40"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <span className="shrink-0 text-[11px] text-ink-soft">{formatRelative(item.created_at)}</span>
                </div>
                {item.body && <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{item.body}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      {typeof document !== "undefined" && createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
          {toasts.map((toast) => (
            <button
              key={toast.toastId}
              type="button"
              onClick={() => openItem(toast)}
              className="pointer-events-auto rounded-2xl border border-brand-100 bg-surface p-4 text-left shadow-pop"
            >
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Sparkles className="h-4 w-4 text-brand-600" /> {toast.title}
              </p>
              {toast.body && <p className="mt-1 text-xs text-ink-soft">{toast.body}</p>}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

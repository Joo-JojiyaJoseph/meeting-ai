import { Mic, MicOff, Video, Crown } from "lucide-react";
import { clsx } from "clsx";

const TILE_TINTS = [
  "from-violet-500 to-indigo-500",
  "from-sky-500 to-cyan-400",
  "from-fuchsia-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
  "from-blue-500 to-violet-500",
];

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || name[0].toUpperCase();
}

function displayName(p) {
  return p.user?.name || p.guest_name || "Guest";
}

/**
 * A muted "video grid" of meeting participants. There's no live video feed to
 * show here (that lives in MeetingRoomPage/Meet embed) — this is a glanceable
 * roster styled like a call grid: initials avatar, attendance state, and a
 * mic glyph driven by real `attended` / `is_organizer` data only.
 */
export function ParticipantTiles({ participants = [] }) {
  const shown = participants.slice(0, 6);
  const overflow = participants.length - shown.length;

  if (shown.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-line bg-canvas text-sm text-ink-soft">
        No participants added yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {shown.map((p, i) => {
        const attended = p.attended !== false && p.attended !== null;
        return (
          <div
            key={p.id ?? i}
            className={clsx(
              "group relative flex aspect-[4/3] flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br text-white shadow-sm",
              TILE_TINTS[i % TILE_TINTS.length],
              !attended && "opacity-50 saturate-50",
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold backdrop-blur-sm">
              {initials(displayName(p))}
            </span>
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/25 px-2 py-1 backdrop-blur-[2px]">
              <span className="truncate text-[11px] font-medium">{displayName(p)}</span>
              <span className="flex shrink-0 items-center gap-1">
                {p.is_organizer && <Crown className="h-3 w-3 text-amber-300" />}
                {attended ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3 text-white/70" />}
              </span>
            </div>
          </div>
        );
      })}
      {overflow > 0 && (
        <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-line bg-canvas text-sm font-medium text-ink-soft">
          +{overflow} more
        </div>
      )}
      {shown.length % 2 === 1 && overflow <= 0 && (
        <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-line/70 bg-canvas/60 text-ink-soft">
          <Video className="h-5 w-5 opacity-40" />
        </div>
      )}
    </div>
  );
}

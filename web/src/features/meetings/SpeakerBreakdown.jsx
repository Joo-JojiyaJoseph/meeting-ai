import { Users2 } from "lucide-react";
import { useTranscript } from "./detail-api";
import { Skeleton } from "@/components/ui/Skeleton";

const BAR_TINTS = ["bg-violet-500", "bg-sky-500", "bg-fuchsia-500", "bg-amber-500", "bg-emerald-500"];

/**
 * Ranks speakers by measured talk time (sum of segment durations), computed
 * from the real transcript — never a fabricated sentiment score. This is the
 * "who talked how much" view, grounded the same way the rest of the app is.
 */
export function SpeakerBreakdown({ meetingId, enabled }) {
  const { data, isLoading } = useTranscript(meetingId, enabled);

  if (!enabled) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-canvas px-3 py-6 text-center text-sm text-ink-soft">
        Speaker breakdown appears once this meeting is processed.
      </p>
    );
  }
  if (isLoading) return <Skeleton className="h-40 rounded-xl" />;

  const segments = data?.data ?? [];
  if (segments.length === 0) {
    return <p className="text-sm text-ink-soft">No transcript segments to summarize yet.</p>;
  }

  const bySpeaker = new Map();
  for (const seg of segments) {
    const name = seg.speaker || "Unknown";
    const duration = Math.max(0, (seg.end_ms ?? seg.start_ms) - seg.start_ms) || 1000;
    bySpeaker.set(name, (bySpeaker.get(name) ?? 0) + duration);
  }
  const total = [...bySpeaker.values()].reduce((a, b) => a + b, 0) || 1;
  const ranked = [...bySpeaker.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <ul className="space-y-3">
      {ranked.map(([name, ms], i) => {
        const pct = Math.round((ms / total) * 100);
        return (
          <li key={name} className="flex items-center gap-3">
            <span className="w-24 shrink-0 truncate text-sm font-medium text-ink">{name}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span
                className={`block h-full rounded-full ${BAR_TINTS[i % BAR_TINTS.length]}`}
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </span>
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-ink-soft">{pct}%</span>
          </li>
        );
      })}
    </ul>
  );
}

export function SpeakerBreakdownCard({ meetingId, enabled }) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-ink">
        <Users2 className="h-4 w-4 text-brand-600" /> Talk-time breakdown
      </h3>
      <SpeakerBreakdown meetingId={meetingId} enabled={enabled} />
    </div>
  );
}

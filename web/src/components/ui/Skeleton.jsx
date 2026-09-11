import { clsx } from "clsx";

export function Skeleton({ className }) {
  return (
    <div className={clsx("relative overflow-hidden rounded-xl bg-slate-200/70", className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

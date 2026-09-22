import { clsx } from "clsx";

export function Card({ className, glass = true, ...props }) {
  return (
    <div
      className={clsx(
        glass ? "glass-panel" : "rounded-2xl border border-line/80 bg-surface shadow-card",
        "transition-all duration-200 hover:shadow-glass-lg",
        className,
      )}
      {...props}
    />
  );
}

import { clsx } from "clsx";

export function Card({ className, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-line/80 bg-surface shadow-card transition-shadow duration-200 hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

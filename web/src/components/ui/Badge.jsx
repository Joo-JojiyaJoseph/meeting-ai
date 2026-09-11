import { clsx } from "clsx";

const tones = {
  neutral: "bg-slate-50 text-ink-soft border-line",
  brand: "bg-brand-50 text-brand-700 border-brand-100",
  info: "bg-sky-50 text-info-600 border-sky-100",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  danger: "bg-rose-50 text-rose-700 border-rose-100",
};

export function Badge({ tone = "neutral", children }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}

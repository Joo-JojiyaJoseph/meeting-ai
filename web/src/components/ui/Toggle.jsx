import { clsx } from "clsx";

export function Toggle({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={clsx(
        "focus-ring relative h-6 w-11 shrink-0 rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-brand-500" : "bg-line"
      )}
    >
      <span
        className={clsx(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

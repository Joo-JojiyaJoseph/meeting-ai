import { clsx } from "clsx";

const variants = {
  primary: "bg-brand-500 text-white shadow-sm hover:bg-brand-600 hover:shadow-md",
  secondary: "bg-info-500 text-white shadow-sm hover:bg-info-600 hover:shadow-md",
  outline: "border border-line bg-surface text-ink shadow-sm hover:border-brand-200 hover:bg-brand-50",
  ghost: "bg-transparent text-ink-soft hover:bg-canvas hover:text-ink",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
  ai: "bg-ai text-white shadow-sm hover:opacity-95 hover:shadow-md",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({ variant = "primary", size = "md", className, ...props }) {
  return (
    <button
      className={clsx(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant] ?? variants.primary,
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

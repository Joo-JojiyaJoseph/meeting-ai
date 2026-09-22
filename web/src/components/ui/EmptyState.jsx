import { motion } from "framer-motion";

export function EmptyState({ icon: Icon, illustration: Illustration, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-panel flex flex-col items-center justify-center px-6 py-14 text-center"
    >
      {Illustration ? (
        <Illustration className="mb-2 h-32 w-40" />
      ) : (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ai text-white shadow-glow">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

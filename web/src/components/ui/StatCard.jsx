import { motion } from "framer-motion";
import { Card } from "./Card";

const iconTone = {
  brand: "bg-brand-500/10 text-brand-600",
  info: "bg-info-500/10 text-info-500",
  warning: "bg-amber-500/10 text-amber-600",
};

export function StatCard({ label, value, icon: Icon, tone = "brand", index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Card className="group p-5 hover:-translate-y-0.5">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-ink-soft">{label}</span>
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconTone[tone] ?? iconTone.brand}`}>
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        </div>
        <div className="mt-3 font-display text-3xl font-semibold tabular-nums tracking-tight text-ink">{value}</div>
      </Card>
    </motion.div>
  );
}

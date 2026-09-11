import { motion } from "framer-motion";
import { Check, Loader2, Circle, AlertTriangle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const STAGES = [
  { key: "transcript", label: "Processing transcript..." },
  { key: "summary", label: "Generating meeting summary..." },
  { key: "decisions", label: "Extracting decisions..." },
  { key: "action_items", label: "Creating action items..." },
  { key: "mom", label: "Preparing minutes of meeting..." },
  { key: "indexed", label: "Indexing insights..." },
];

export function AiProcessingStatus({ status, onRetry }) {
  const failed = status.status === "failed";
  const firstIncomplete = STAGES.findIndex((s) => !status.stages[s.key]);
  const headline = failed
    ? "AI processing failed"
    : status.is_terminal
      ? "AI insights are ready"
      : "AI is analyzing your meeting...";

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 bg-ai px-5 py-4 text-white">
        {failed ? <AlertTriangle className="h-5 w-5" /> : status.is_terminal ? <Check className="h-5 w-5" /> : <Loader2 className="h-5 w-5 animate-spin" />}
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-display text-sm font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> AI Meeting Intelligence
          </p>
          <p className="text-xs text-white/80">{status.label || headline}</p>
        </div>
      </div>
      <div className="space-y-1 bg-ai-soft/60 p-4">
        {STAGES.map((stage, i) => {
          const done = status.stages[stage.key];
          const active = !done && !failed && i === firstIncomplete && !status.is_terminal;
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5"
            >
              {done ? <Check className="h-4 w-4 text-emerald-500" /> : active ? <Loader2 className="h-4 w-4 animate-spin text-brand-500" /> : failed && i === firstIncomplete ? <AlertTriangle className="h-4 w-4 text-rose-500" /> : <Circle className="h-4 w-4 text-line" />}
              <span className={done ? "text-sm text-ink" : active ? "text-sm font-medium text-ink" : "text-sm text-ink-soft"}>{stage.label}</span>
            </motion.div>
          );
        })}
      </div>
      {failed && onRetry && (
        <div className="border-t border-line px-4 py-3">
          <Button variant="secondary" size="sm" onClick={onRetry}>Retry processing</Button>
        </div>
      )}
    </Card>
  );
}

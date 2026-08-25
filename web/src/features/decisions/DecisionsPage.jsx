import { useState } from "react";
import { Link } from "react-router-dom";
import { Gavel, Sparkles, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import { useDecisions, useApproveDecision, useRejectDecision } from "./api";

const FILTERS = [
  { label: "All", value: "" },
  { label: "Proposed", value: "proposed" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const statusTone = { proposed: "warning", approved: "success", rejected: "danger" };

export function DecisionsPage() {
  const [filter, setFilter] = useState(0);
  const { data, isLoading } = useDecisions(FILTERS[filter].value ? { status: FILTERS[filter].value } : {});
  const approve = useApproveDecision();
  const reject = useRejectDecision();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Decisions</h1>
        <p className="mt-1 text-sm text-ink-soft">Every decision the AI has extracted, across all meetings.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f, i) => (
          <button
            key={f.label}
            onClick={() => setFilter(i)}
            className={`focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === i ? "border-brand-200 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-soft hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="space-y-3">
          {data.data.map((d) => {
            const busy = (approve.isPending && approve.variables?.id === d.id) || (reject.isPending && reject.variables?.id === d.id);
            return (
              <Card key={d.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {d.topic && <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{d.topic}</p>}
                    <p className="mt-0.5 font-medium text-ink">{d.decision}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {d.created_by_ai && <Sparkles className="h-3.5 w-3.5 text-ai" aria-label="AI-generated" />}
                    <Badge tone={statusTone[d.status] ?? "neutral"}>{d.status}</Badge>
                  </div>
                </div>
                {d.context && <p className="mt-1.5 text-sm text-ink-soft">{d.context}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
                  {d.meeting && (
                    <Link to={`/meetings/${d.meeting.id}`} className="focus-ring font-medium text-brand-700 hover:underline">
                      {d.meeting.title}
                    </Link>
                  )}
                  {d.meeting?.scheduled_start_at && <span>{formatDate(d.meeting.scheduled_start_at)}</span>}
                  {d.project?.name && <Badge tone="neutral">{d.project.name}</Badge>}
                  <ConfidenceBadge level={d.ai_confidence} />
                </div>
                {d.status === "proposed" && d.meeting?.id && (
                  <div className="mt-3 flex gap-2 border-t border-line pt-3">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => approve.mutate({ meetingId: d.meeting.id, id: d.id })}
                    >
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => reject.mutate({ meetingId: d.meeting.id, id: d.id })}
                    >
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Gavel}
          title="No decisions yet"
          description="Decisions extracted from processed meetings will show up here."
        />
      )}
    </div>
  );
}

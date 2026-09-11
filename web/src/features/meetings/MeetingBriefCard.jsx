import { Link } from "react-router-dom";
import { AlertTriangle, CheckSquare, ClipboardList, Gavel, HelpCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import { useMeetingBrief } from "./detail-api";

function Section({ icon: Icon, title, children }) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon className="h-4 w-4 text-brand-600" /> {title}
      </h3>
      {children}
    </section>
  );
}

export function MeetingBriefCard({ meetingId, compact = false }) {
  const { data, isLoading, isError } = useMeetingBrief(meetingId);

  if (isLoading) return <Skeleton className={compact ? "h-64 rounded-2xl" : "h-80 rounded-2xl"} />;
  if (isError) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Brief unavailable"
        description="The pre-meeting brief could not be loaded. You can still run the meeting."
      />
    );
  }
  if (!data) return null;

  const empty = !data.talking_points?.length
    && !data.open_tasks?.length
    && !data.carryover_actions?.length
    && !data.recent_decisions?.length
    && !data.open_questions?.length
    && !data.prior_meetings?.length;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 bg-ai px-5 py-4 text-white">
        <div>
          <p className="flex items-center gap-1.5 font-display text-sm font-semibold">
            <Sparkles className="h-4 w-4" /> AI Meeting Brief
          </p>
          <p className="mt-0.5 text-xs text-white/80">
            {data.meeting?.project?.name
              ? `Prep from prior ${data.meeting.project.name} meetings`
              : "Prep from related meeting history"}
            {data.used_ai ? " · grounded AI" : " · from your records"}
          </p>
        </div>
        {data.used_ai && <Badge tone="info">AI</Badge>}
      </div>

      <div className={`space-y-5 p-5 ${compact ? "max-h-[28rem] overflow-y-auto" : ""}`}>
        {data.ai_summary && !compact && (
          <p className="rounded-xl bg-ai-soft px-4 py-3 text-sm leading-relaxed text-ink">{data.ai_summary}</p>
        )}

        {data.talking_points?.length > 0 && (
          <Section icon={ClipboardList} title="Talking points">
            <ul className="space-y-2">
              {data.talking_points.map((point, index) => (
                <li key={index} className="flex gap-2 text-sm text-ink">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {point}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.open_tasks?.length > 0 && (
          <Section icon={CheckSquare} title="Open tasks">
            <ul className="space-y-2">
              {data.open_tasks.map((task) => (
                <li key={task.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-ink">{task.title}</span>
                  <span className="shrink-0 text-ink-soft">
                    {task.is_overdue ? <Badge tone="danger">overdue</Badge> : task.assignee || "Unassigned"}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.carryover_actions?.length > 0 && (
          <Section icon={CheckSquare} title="Carry-over actions">
            <ul className="space-y-2">
              {data.carryover_actions.map((item) => (
                <li key={item.id} className="text-sm text-ink">
                  {item.title}
                  {item.meeting && (
                    <Link to={`/meetings/${item.meeting.id}`} className="ml-2 text-info-600 hover:underline">
                      {item.meeting.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.recent_decisions?.length > 0 && (
          <Section icon={Gavel} title="Recent decisions">
            <ul className="space-y-2">
              {data.recent_decisions.map((decision) => (
                <li key={decision.id} className="text-sm text-ink">
                  {decision.decision || decision.topic}
                  {decision.status && <Badge tone={decision.status === "approved" ? "success" : "neutral"}>{String(decision.status)}</Badge>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.open_questions?.length > 0 && (
          <Section icon={HelpCircle} title="Unresolved questions">
            <ul className="space-y-2">
              {data.open_questions.map((item) => (
                <li key={item.id} className="text-sm text-ink">{item.question}</li>
              ))}
            </ul>
          </Section>
        )}

        {data.risks?.length > 0 && (
          <Section icon={AlertTriangle} title="Open risks">
            <ul className="space-y-2">
              {data.risks.map((risk) => (
                <li key={risk.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink">{risk.title}</span>
                  {risk.severity && <Badge tone={risk.severity === "high" ? "danger" : risk.severity === "medium" ? "warning" : "neutral"}>{risk.severity}</Badge>}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {data.prior_meetings?.length > 0 && !compact && (
          <Section icon={ClipboardList} title="Prior meetings">
            <ul className="space-y-2">
              {data.prior_meetings.map((meeting) => (
                <li key={meeting.id}>
                  <Link to={`/meetings/${meeting.id}`} className="text-sm font-medium text-brand-700 hover:underline">
                    {meeting.title}
                  </Link>
                  <span className="ml-2 text-xs text-ink-soft">{meeting.scheduled_start_at ? formatDate(meeting.scheduled_start_at) : ""}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {empty && (
          <p className="text-sm text-ink-soft">
            No prior intelligence yet. After this meeting is processed, future briefs will include its decisions, actions, and questions.
          </p>
        )}
      </div>
    </Card>
  );
}

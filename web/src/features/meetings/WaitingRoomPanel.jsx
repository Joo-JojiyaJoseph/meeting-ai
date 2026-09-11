import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Clock3, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

function useJoinRequests(meetingId) {
  return useQuery({
    queryKey: ["join-requests", meetingId],
    queryFn: async () => (await api.get(`/v1/meetings/${meetingId}/join-requests`)).data,
    refetchInterval: 5000,
  });
}

function useDecideJoinRequest(meetingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ participantId, decision }) =>
      (await api.post(`/v1/meetings/${meetingId}/participants/${participantId}/${decision}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["join-requests", meetingId] });
      qc.invalidateQueries({ queryKey: ["meeting", meetingId] });
    },
  });
}

/** Shown to the organizer: people waiting after requesting to join via share link/code. */
export function WaitingRoomPanel({ meetingId }) {
  const { data } = useJoinRequests(meetingId);
  const decide = useDecideJoinRequest(meetingId);
  const requests = data?.data ?? [];

  if (requests.length === 0) return null;

  return (
    <Card className="overflow-hidden border-brand-100">
      <div className="flex items-center gap-2 bg-brand-50 px-5 py-3">
        <Clock3 className="h-4 w-4 text-brand-600" />
        <h3 className="font-display text-sm font-semibold text-ink">
          Waiting to join &middot; {requests.length}
        </h3>
      </div>
      <ul className="divide-y divide-line">
        {requests.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{r.guest_name || "Guest"}</p>
              {r.guest_email && <p className="truncate text-xs text-ink-soft">{r.guest_email}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={decide.isPending}
                onClick={() => decide.mutate({ participantId: r.id, decision: "deny" })}
              >
                <X className="h-4 w-4" /> Deny
              </Button>
              <Button
                size="sm"
                disabled={decide.isPending}
                onClick={() => decide.mutate({ participantId: r.id, decision: "approve" })}
              >
                <Check className="h-4 w-4" /> Admit
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

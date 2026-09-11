import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, CheckCircle2, Clock, Sparkles, Video, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatTime } from "@/lib/format";
import { useJoinMeetingInfo, useRequestJoin, useJoinRequestStatus } from "./api";

/** Landing page for people who only have a code (not a full link) to type in. */
export function EnterJoinCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) navigate(`/join/${trimmed}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas bg-mesh px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-line/80 bg-surface p-6 shadow-card">
        <div className="flex items-center justify-center gap-2 text-brand-600">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ai text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold text-ink">MeetingAI</span>
        </div>
        <label className="block text-sm font-medium text-ink">
          Meeting code
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="field mt-1.5 text-center font-mono text-lg tracking-widest uppercase"
            placeholder="ABCD1234"
            maxLength={12}
          />
        </label>
        <Button type="submit" className="w-full" disabled={!code.trim()}>Continue</Button>
      </form>
    </div>
  );
}

export function JoinMeetingPage() {
  const { shareCode = "" } = useParams();
  const { data: meeting, isLoading, isError } = useJoinMeetingInfo(shareCode);
  const requestJoin = useRequestJoin(shareCode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [requestToken, setRequestToken] = useState(null);
  const { data: status } = useJoinRequestStatus(shareCode, requestToken);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    requestJoin.mutate(
      { name: name.trim(), email: email.trim() || undefined },
      { onSuccess: (data) => setRequestToken(data.request_token) },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas bg-mesh px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="flex items-center justify-center gap-2 text-brand-600">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ai text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold text-ink">MeetingAI</span>
        </div>

        <div className="rounded-2xl border border-line/80 bg-surface p-6 shadow-card">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <XCircle className="h-8 w-8 text-rose-500" />
              <p className="font-display font-semibold text-ink">This link isn't valid</p>
              <p className="text-sm text-ink-soft">Double-check the code, or ask the organizer to resend it.</p>
            </div>
          )}

          {meeting && !status && (
            <>
              <h1 className="font-display text-xl font-semibold text-ink">{meeting.title}</h1>
              <div className="mt-2 space-y-1.5 text-sm text-ink-soft">
                <p className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(meeting.scheduled_start_at)}</p>
                <p className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{formatTime(meeting.scheduled_start_at)}–{formatTime(meeting.scheduled_end_at)}</p>
                {meeting.organizer_name && <p>Hosted by {meeting.organizer_name}</p>}
              </div>

              <form onSubmit={submit} className="mt-5 space-y-3">
                <label className="block text-sm font-medium text-ink">
                  Your name
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="field mt-1.5" placeholder="Jordan Lee" />
                </label>
                <label className="block text-sm font-medium text-ink">
                  Email <span className="font-normal text-ink-soft">(optional)</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1.5" placeholder="jordan@example.com" />
                </label>
                {requestJoin.isError && (
                  <p className="text-sm text-rose-600">{requestJoin.error?.response?.data?.message || "Couldn't submit your request. Try again."}</p>
                )}
                <Button type="submit" className="w-full" disabled={requestJoin.isPending || !name.trim()}>
                  {requestJoin.isPending ? "Requesting…" : "Ask to join"}
                </Button>
                <p className="text-center text-xs text-ink-soft">The organizer will let you in once they approve your request.</p>
              </form>
            </>
          )}

          {status?.join_status === "pending" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-ai-soft text-brand-600">
                <Clock className="h-6 w-6" />
              </span>
              <p className="font-display font-semibold text-ink">Waiting for the host…</p>
              <p className="text-sm text-ink-soft">You'll be let in as soon as {meeting?.organizer_name || "the organizer"} approves your request.</p>
            </div>
          )}

          {status?.join_status === "approved" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="font-display font-semibold text-ink">You're in!</p>
              {status.meet_url ? (
                <Button onClick={() => window.location.assign(status.meet_url)}>
                  <Video className="h-4 w-4" /> Join the meeting
                </Button>
              ) : (
                <p className="text-sm text-ink-soft">The host will share the meeting link with you shortly.</p>
              )}
            </div>
          )}

          {status?.join_status === "denied" && (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <XCircle className="h-8 w-8 text-rose-500" />
              <p className="font-display font-semibold text-ink">Your request wasn't approved</p>
              <p className="text-sm text-ink-soft">Reach out to the organizer directly if you think this is a mistake.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

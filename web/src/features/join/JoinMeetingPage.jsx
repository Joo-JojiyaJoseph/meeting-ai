import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, Sparkles, Video, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatTime } from "@/lib/format";
import { useJoinMeetingInfo } from "./api";

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
    <div className="flex min-h-screen items-center justify-center bg-mesh bg-fixed px-4 py-10">
      <form onSubmit={submit} className="glass-panel-strong w-full max-w-sm space-y-4 p-6">
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
            className="field mt-1.5 bg-white/70 text-center font-mono text-lg tracking-widest uppercase"
            placeholder="ABCD1234"
            maxLength={12}
          />
        </label>
        <Button type="submit" className="w-full" disabled={!code.trim()}>Continue</Button>
      </form>
    </div>
  );
}

/**
 * Google Meet is the actual meeting platform — this app is only the
 * interface around it. This page's job is just to confirm "yes, this is the
 * right meeting" and hand the person the real Meet link. Who actually gets
 * into the call is entirely governed by Google Meet's own "ask to join" /
 * host-admit flow, not anything tracked here.
 */
export function JoinMeetingPage() {
  const { shareCode = "" } = useParams();
  const { data: meeting, isLoading, isError } = useJoinMeetingInfo(shareCode);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh bg-fixed px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="flex items-center justify-center gap-2 text-brand-600">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ai text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-semibold text-ink">MeetingAI</span>
        </div>

        <div className="glass-panel-strong p-6">
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

          {meeting && (
            <>
              <h1 className="font-display text-xl font-semibold text-ink">{meeting.title}</h1>
              <div className="mt-2 space-y-1.5 text-sm text-ink-soft">
                <p className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(meeting.scheduled_start_at)}</p>
                <p className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{formatTime(meeting.scheduled_start_at)}–{formatTime(meeting.scheduled_end_at)}</p>
                {meeting.organizer_name && <p>Hosted by {meeting.organizer_name}</p>}
              </div>

              <div className="mt-6">
                {meeting.meet_url ? (
                  <Button className="w-full" onClick={() => window.location.assign(meeting.meet_url)}>
                    <Video className="h-4 w-4" /> Join on Google Meet
                  </Button>
                ) : (
                  <p className="rounded-xl border border-dashed border-line bg-white/50 px-3 py-4 text-center text-sm text-ink-soft">
                    The organizer hasn't set up a Google Meet link for this meeting yet.
                  </p>
                )}
                <p className="mt-3 text-center text-xs text-ink-soft">
                  This opens Google Meet directly — Google handles who's let into the call.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

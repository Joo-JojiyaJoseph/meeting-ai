import { useState } from "react";
import { Check, Copy, MessageCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGoogleIntegration, useConnectGoogle } from "@/features/auth/google-api";

function joinUrl(shareCode) {
  return `${window.location.origin}/join/${shareCode}`;
}

/**
 * Google Meet is the actual meeting platform; this app is only the
 * interface around it. So the thing worth sharing is the real Google Meet
 * link — the share-code page is just a friendly, branded landing page that
 * confirms the meeting before handing the person the real link. Who gets
 * into the call is entirely up to Google Meet's own admission flow.
 */
export function ShareMeetingModal({ meeting, onClose }) {
  const [copied, setCopied] = useState(null);
  const meetUrl = meeting.google?.meet_url;
  const landingUrl = joinUrl(meeting.share_code);
  const { data: googleStatus } = useGoogleIntegration();
  const connectGoogle = useConnectGoogle();

  const copy = async (value, which) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard API may be unavailable — the value is still visible in
      // the field below for a manual copy.
    }
  };

  const shareText = meetUrl
    ? `Join "${meeting.title}" on Google Meet: ${meetUrl}`
    : `Join "${meeting.title}": ${landingUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-panel max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-semibold text-ink">Share this meeting</h2>
        <p className="text-sm text-ink-soft">
          This is the real Google Meet link — anyone you send it to joins the actual
          call, and Google Meet's own "ask to join" screen governs who gets in.
        </p>

        {!meetUrl && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="text-sm text-amber-800">
              {googleStatus?.connected
                ? "No Google Meet link yet for this meeting — it may still be creating, or wasn't requested when scheduled."
                : "No Google Meet link yet — connect your Google account so real meeting links can be created."}
            </p>
            {!googleStatus?.connected && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={connectGoogle.isPending}
                onClick={() => connectGoogle.mutate(window.location.pathname)}
              >
                {connectGoogle.isPending ? "Redirecting…" : "Connect Google"}
              </Button>
            )}
          </div>
        )}

        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="focus-ring flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
        >
          <MessageCircle className="h-4 w-4" /> Share via WhatsApp
        </a>

        <div className="space-y-3">
          {meetUrl && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
                <Video className="h-3.5 w-3.5" /> Google Meet link
              </label>
              <div className="flex gap-2">
                <input readOnly value={meetUrl} className="field flex-1 bg-white/70 text-sm" onFocus={(e) => e.target.select()} />
                <Button type="button" variant="outline" onClick={() => copy(meetUrl, "meet")}>
                  {copied === "meet" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">
              {meetUrl ? "Or share the branded landing page" : "Landing page (until a Meet link exists)"}
            </label>
            <div className="flex gap-2">
              <input readOnly value={landingUrl} className="field flex-1 bg-white/70 text-sm" onFocus={(e) => e.target.select()} />
              <Button type="button" variant="outline" onClick={() => copy(landingUrl, "link")}>
                {copied === "link" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-ink-soft">Shows the meeting details, then links straight to Google Meet.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">Or share this code</label>
            <div className="flex gap-2">
              <input readOnly value={meeting.share_code} className="field flex-1 bg-white/70 text-center font-mono text-lg tracking-widest" onFocus={(e) => e.target.select()} />
              <Button type="button" variant="outline" onClick={() => copy(meeting.share_code, "code")}>
                {copied === "code" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-ink-soft">Participants enter it at {window.location.origin}/join</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

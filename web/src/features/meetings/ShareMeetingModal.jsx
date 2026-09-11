import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

function joinUrl(shareCode) {
  return `${window.location.origin}/join/${shareCode}`;
}

export function ShareMeetingModal({ meeting, onClose }) {
  const [copied, setCopied] = useState(null);
  const link = joinUrl(meeting.share_code);

  const copy = async (value, which) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard API may be unavailable (e.g. insecure context) — the value is
      // still visible in the field below for a manual copy.
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `Join "${meeting.title}" on MeetingAI: ${link}\n\nOr use code ${meeting.share_code} at ${window.location.origin}/join`,
  )}`;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-panel max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl font-semibold text-ink">Share this meeting</h2>
        <p className="text-sm text-ink-soft">
          Anyone with this link or code can ask to join. You'll approve each request before they get in.
        </p>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="focus-ring flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600"
        >
          <MessageCircle className="h-4 w-4" /> Share via WhatsApp
        </a>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">Join link</label>
            <div className="flex gap-2">
              <input readOnly value={link} className="field flex-1 text-sm" onFocus={(e) => e.target.select()} />
              <Button type="button" variant="outline" onClick={() => copy(link, "link")}>
                {copied === "link" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">Or share this code</label>
            <div className="flex gap-2">
              <input readOnly value={meeting.share_code} className="field flex-1 text-center font-mono text-lg tracking-widest" onFocus={(e) => e.target.select()} />
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

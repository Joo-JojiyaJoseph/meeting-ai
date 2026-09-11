import { useEffect, useState } from "react";
import { RefreshCw, Video } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth";

const IFRAME_ALLOW = "camera; microphone; fullscreen; display-capture; autoplay; clipboard-write; encrypted-media";

function jitsiSrc(roomId, displayName) {
  const room = `MeetingAI${String(roomId).replace(/[^a-zA-Z0-9]/g, "")}`;
  const hash = [
    "config.prejoinPageEnabled=true",
    "config.disableDeepLinking=true",
    "config.startWithAudioMuted=true",
    "interfaceConfig.MOBILE_APP_PROMO=false",
    displayName ? `userInfo.displayName="${encodeURIComponent(displayName)}"` : "",
  ].filter(Boolean).join("&");
  return `https://meet.jit.si/${room}#${hash}`;
}

/**
 * In-app video room. Google Meet cannot be iframed (X-Frame-Options), so the
 * live conference uses Jitsi — which allows embedding — in this window.
 * An existing Google Meet URL is offered as a same-tab option only.
 */
export function MeetEmbed({ roomId, title = "Meeting", googleMeetUrl }) {
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState("loading");
  const [nonce, setNonce] = useState(0);
  const src = roomId ? jitsiSrc(roomId, user?.name) : "";

  useEffect(() => {
    if (!src) return undefined;
    setStatus("loading");
    const timer = window.setTimeout(() => setStatus("ready"), 1200);
    return () => window.clearTimeout(timer);
  }, [src, nonce]);

  if (!roomId) {
    return (
      <div className="flex h-full min-h-[24rem] flex-col items-center justify-center gap-3 bg-[#0B1220] text-white">
        <Video className="h-10 w-10 text-white/40" />
        <p className="text-sm text-white/60">Meeting room is not available.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#0B1220]">
      <iframe
        key={`${src}:${nonce}`}
        title={title}
        src={src}
        allow={IFRAME_ALLOW}
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
        onLoad={() => setStatus("ready")}
      />
      {status === "loading" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0B1220] text-white">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-cyan-300" />
          <p className="text-sm text-white/70">Opening the meeting in this window…</p>
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-md">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={() => setNonce((n) => n + 1)}
        >
          <RefreshCw className="h-4 w-4" /> Reload
        </Button>
        {googleMeetUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => { window.location.assign(googleMeetUrl); }}
          >
            Google Meet
          </Button>
        )}
      </div>
    </div>
  );
}

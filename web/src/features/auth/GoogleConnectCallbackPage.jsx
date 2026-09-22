import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, XCircle } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

/**
 * Google redirects here directly (see GOOGLE_REDIRECT_URI / the backend
 * callback), with the outcome in the query string rather than a JSON body,
 * since a raw API response would otherwise flash in the browser mid-OAuth.
 */
export function GoogleConnectCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);
  const error = params.get("error");

  useEffect(() => {
    if (error) return;
    const token = params.get("token");
    const redirectTo = params.get("redirect_to") || "/dashboard";
    if (token) setToken(token);
    const search = params.get("google_connected") === "1" ? "?google_connected=1" : "?google_connected=0";
    navigate(`${redirectTo}${redirectTo.includes("?") ? "" : search}`, { replace: true });
  }, [error, params, navigate, setToken]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh bg-fixed px-4">
      <div className="glass-panel-strong flex flex-col items-center gap-3 p-8 text-center">
        {error ? (
          <>
            <XCircle className="h-8 w-8 text-rose-500" />
            <p className="font-display font-semibold text-ink">Couldn't connect Google</p>
            <p className="text-sm text-ink-soft">Please try again from the meeting page.</p>
            <button onClick={() => navigate("/dashboard")} className="focus-ring mt-2 text-sm font-medium text-brand-600">
              Back to dashboard
            </button>
          </>
        ) : (
          <>
            <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-xl bg-ai text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <p className="text-sm text-ink-soft">Finishing up with Google…</p>
          </>
        )}
      </div>
    </div>
  );
}

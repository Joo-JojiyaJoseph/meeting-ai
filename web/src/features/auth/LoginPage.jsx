import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { MeetingIllustration } from "@/components/illustrations/MeetingIllustration";
import { useLogin } from "./api";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = (e) => {
    e.preventDefault();
    login.mutate({ email, password }, { onSuccess: () => navigate("/dashboard") });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mesh px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-accent-400/25 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-panel-strong relative grid w-full max-w-4xl grid-cols-1 overflow-hidden lg:grid-cols-2"
      >
        {/* Illustration pane */}
        <div className="relative hidden flex-col justify-between bg-ai p-8 text-white lg:flex">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold">MeetingAI</span>
          </div>
          <MeetingIllustration className="mx-auto w-full max-w-xs" />
          <div>
            <p className="font-display text-lg font-semibold leading-snug">Every meeting, understood.</p>
            <p className="mt-1 text-sm text-white/75">Transcripts, decisions, and action items — grounded, cited, and searchable.</p>
          </div>
        </div>

        {/* Form pane */}
        <div className="p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ai text-white shadow-glow">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-bold text-ink">MeetingAI</span>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-soft">Sign in to your meeting intelligence workspace.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field bg-white/70" placeholder="you@company.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field bg-white/70" placeholder="••••••••" />
            </div>
            {login.isError && (
              <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                We couldn't sign you in. Check your email and password.
              </p>
            )}
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

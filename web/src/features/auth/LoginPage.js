import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
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
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-canvas px-4", children: _jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, className: "w-full max-w-sm", children: [_jsxs("div", { className: "mb-8 flex items-center gap-2", children: [_jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-ai text-white", children: _jsx(Sparkles, { className: "h-5 w-5" }) }), _jsx("span", { className: "font-display text-xl font-semibold text-ink", children: "MeetingAI" })] }), _jsx("h1", { className: "font-display text-2xl font-semibold text-ink", children: "Welcome back" }), _jsx("p", { className: "mt-1 text-sm text-ink-soft", children: "Sign in to your meeting intelligence workspace." }), _jsxs("form", { onSubmit: submit, className: "mt-8 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-ink", children: "Email" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "focus-ring h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm", placeholder: "you@company.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-sm font-medium text-ink", children: "Password" }), _jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "focus-ring h-10 w-full rounded-xl border border-line bg-surface px-3 text-sm", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), login.isError && (_jsx("p", { className: "text-sm text-rose-600", children: "We couldn't sign you in. Check your email and password." })), _jsx(Button, { type: "submit", className: "w-full", disabled: login.isPending, children: login.isPending ? "Signing in…" : "Sign in" })] })] }) }));
}

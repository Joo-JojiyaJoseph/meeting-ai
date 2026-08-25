import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { fetchMe } from "@/features/auth/api";
/**
 * Guards the app shell. If a persisted token exists, hydrate the session (user,
 * orgs, permissions) via /auth/me before rendering, so route-level `can()`
 * checks work on first paint.
 */
export function ProtectedRoute({ children }) {
    const { token, setContext } = useAuthStore();
    const [ready, setReady] = useState(false);
    useEffect(() => {
        if (!token) {
            setReady(true);
            return;
        }
        fetchMe()
            .then((me) => setContext({
            user: me.user,
            organizations: me.organizations,
            permissions: me.permissions,
            organizationId: me.current_organization?.id ?? me.organizations[0]?.id ?? null,
        }))
            .finally(() => setReady(true));
    }, [token, setContext]);
    if (!token)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (!ready)
        return null;
    return _jsx(_Fragment, { children: children });
}

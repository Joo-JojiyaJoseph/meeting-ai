import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useAuthStore = create()(persist((set, get) => ({
    token: null,
    user: null,
    organizationId: null,
    organizations: [],
    permissions: [],
    setSession: ({ token, user, organizations }) => set({
        token,
        user,
        organizations: organizations ?? [],
        organizationId: organizations?.[0]?.id ?? get().organizationId,
    }),
    setContext: ({ user, organizations, permissions, organizationId }) => set((s) => ({
        user: user ?? s.user,
        organizations: organizations ?? s.organizations,
        permissions: permissions ?? s.permissions,
        organizationId: organizationId ?? s.organizationId,
    })),
    setOrganization: (id) => set({ organizationId: id }),
    can: (permission) => {
        const s = get();
        return s.user?.is_super_admin === true || s.permissions.includes(permission);
    },
    clear: () => set({
        token: null,
        user: null,
        organizationId: null,
        organizations: [],
        permissions: [],
    }),
}), {
    name: "meeting-ai-auth",
    partialize: (s) => ({ token: s.token, organizationId: s.organizationId }),
}));

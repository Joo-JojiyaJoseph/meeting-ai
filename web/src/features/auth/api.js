import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
export function useLogin() {
    const setSession = useAuthStore((s) => s.setSession);
    return useMutation({
        mutationFn: async (creds) => {
            const { data } = await api.post("/v1/auth/login", creds);
            return data;
        },
        onSuccess: (data) => setSession(data),
    });
}
export async function fetchMe() {
    const { data } = await api.get("/v1/auth/me");
    return data;
}

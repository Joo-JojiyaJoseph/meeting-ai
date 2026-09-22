import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Whether the current user has a connected Google account in this org. */
export function useGoogleIntegration() {
  return useQuery({
    queryKey: ["integrations", "google"],
    queryFn: async () => (await api.get("/v1/integrations/google")).data,
  });
}

/**
 * Kicks off the Google OAuth consent flow. `redirectTo` is where the SPA
 * lands back on once connected (e.g. the meeting wizard) — the backend
 * round-trips it through the OAuth `state` param.
 */
export function useConnectGoogle() {
  return useMutation({
    mutationFn: async (redirectTo = "/dashboard") => {
      const { data } = await api.get("/v1/auth/google/redirect", { params: { redirect_to: redirectTo } });
      return data.url;
    },
    onSuccess: (url) => {
      window.location.assign(url);
    },
  });
}

export function useDisconnectGoogle() {
  return useMutation({
    mutationFn: async () => (await api.delete("/v1/integrations/google")).data,
  });
}

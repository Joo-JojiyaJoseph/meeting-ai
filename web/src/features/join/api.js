import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Public landing info for a share code — no auth, no org header needed. */
export function useJoinMeetingInfo(shareCode) {
  return useQuery({
    queryKey: ["join-meeting", shareCode],
    enabled: Boolean(shareCode),
    retry: false,
    queryFn: async () => (await api.get(`/v1/meetings/join/${shareCode}`)).data,
  });
}

export function useRequestJoin(shareCode) {
  return useMutation({
    mutationFn: async ({ name, email }) => (await api.post(`/v1/meetings/join/${shareCode}`, { name, email })).data,
  });
}

/** Polls while the request sits in the waiting room; stops once decided. */
export function useJoinRequestStatus(shareCode, requestToken) {
  return useQuery({
    queryKey: ["join-status", shareCode, requestToken],
    enabled: Boolean(shareCode && requestToken),
    queryFn: async () => (await api.get(`/v1/meetings/join/${shareCode}/${requestToken}`)).data,
    refetchInterval: (query) => (query.state.data?.join_status === "pending" ? 3000 : false),
  });
}

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * Public landing info for a share code — no auth, no org header needed.
 * Returns the real Google Meet URL directly: Google Meet's own "ask to
 * join" flow is what actually governs entry, so there's nothing for our
 * app to gate here.
 */
export function useJoinMeetingInfo(shareCode) {
  return useQuery({
    queryKey: ["join-meeting", shareCode],
    enabled: Boolean(shareCode),
    retry: false,
    queryFn: async () => (await api.get(`/v1/meetings/join/${shareCode}`)).data,
  });
}

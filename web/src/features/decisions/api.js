import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDecisions(params = {}) {
  return useQuery({
    queryKey: ["decisions", params],
    queryFn: async () => (await api.get("/v1/decisions", { params })).data,
  });
}

export function useApproveDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ meetingId, id }) => api.post(`/v1/meetings/${meetingId}/decisions/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decisions"] }),
  });
}

export function useRejectDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ meetingId, id }) => api.post(`/v1/meetings/${meetingId}/decisions/${id}/reject`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["decisions"] }),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
export function useTasks(params = {}) {
    return useQuery({
        queryKey: ["tasks", params],
        queryFn: async () => (await api.get("/v1/tasks", { params })).data,
    });
}
export function useUpdateTaskStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }) => (await api.patch(`/v1/tasks/${id}`, { status })).data,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
    });
}
/** Accept an AI-suggested action item, converting it into a tracked task (§25). */
export function useAcceptActionItem(meetingId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (item) => api.post(`/v1/meetings/${meetingId}/actions/${item.id}/accept`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["actions", meetingId] });
            qc.invalidateQueries({ queryKey: ["tasks"] });
            qc.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
}
export function useRejectActionItem(meetingId) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (item) => api.post(`/v1/meetings/${meetingId}/actions/${item.id}/reject`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["actions", meetingId] }),
    });
}

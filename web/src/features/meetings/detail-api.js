import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
export function useMeeting(id) {
    return useQuery({
        queryKey: ["meeting", id],
        queryFn: async () => (await api.get(`/v1/meetings/${id}`)).data,
        select: (d) => ("data" in d ? d.data : d),
    });
}
/** Polls while processing is in-flight; stops once terminal. */
export function useProcessingStatus(id) {
    return useQuery({
        queryKey: ["processing", id],
        queryFn: async () => (await api.get(`/v1/meetings/${id}/processing-status`)).data,
        refetchInterval: (query) => query.state.data && !query.state.data.is_terminal ? 3000 : false,
    });
}
export function useTranscript(id, enabled) {
    return useQuery({
        queryKey: ["transcript", id],
        enabled,
        queryFn: async () => (await api.get(`/v1/meetings/${id}/transcript`)).data,
    });
}
export function useSummary(id, enabled) {
    return useQuery({
        queryKey: ["summary", id],
        enabled,
        queryFn: async () => (await api.get(`/v1/meetings/${id}/summary`)).data,
    });
}
export function useDecisions(id, enabled) {
    return useQuery({
        queryKey: ["decisions", id],
        enabled,
        queryFn: async () => (await api.get(`/v1/meetings/${id}/decisions`)).data,
    });
}
export function useActionItems(id, enabled) {
    return useQuery({
        queryKey: ["actions", id],
        enabled,
        queryFn: async () => (await api.get(`/v1/meetings/${id}/actions`)).data,
    });
}
export function useMom(id, enabled) {
    return useQuery({
        queryKey: ["mom", id],
        enabled,
        queryFn: async () => (await api.get(`/v1/meetings/${id}/mom`)).data.data,
    });
}

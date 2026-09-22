import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useNotes(meetingId, enabled = true) {
  return useQuery({
    queryKey: ["notes", meetingId],
    enabled: Boolean(meetingId) && enabled,
    queryFn: async () => (await api.get(`/v1/meetings/${meetingId}/notes`)).data,
  });
}

export function useCreateNote(meetingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content) => (await api.post(`/v1/meetings/${meetingId}/notes`, { content })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", meetingId] }),
  });
}

export function useUpdateNote(meetingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }) => (await api.patch(`/v1/meetings/${meetingId}/notes/${id}`, { content })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", meetingId] }),
  });
}

export function useDeleteNote(meetingId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/v1/meetings/${meetingId}/notes/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes", meetingId] }),
  });
}

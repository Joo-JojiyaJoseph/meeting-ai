import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSemanticSearch() {
  return useMutation({
    mutationFn: async ({ q, limit = 8 }) => (await api.post("/v1/search", { q, limit })).data.data,
  });
}

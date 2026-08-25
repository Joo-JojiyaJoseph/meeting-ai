import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
export function useAnalytics() {
    return useQuery({
        queryKey: ["analytics"],
        queryFn: async () => (await api.get("/v1/analytics")).data.data,
    });
}

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
export function useMeetings(params = {}) {
    return useQuery({
        queryKey: ["meetings", params],
        queryFn: async () => {
            const { data } = await api.get("/v1/meetings", { params });
            return data;
        },
    });
}

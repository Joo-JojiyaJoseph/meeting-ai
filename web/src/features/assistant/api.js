import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
export function useAsk() {
    return useMutation({
        mutationFn: async (input) => {
            const { data } = await api.post("/v1/assistant/ask", input);
            return data;
        },
    });
}

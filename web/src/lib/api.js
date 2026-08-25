import axios from "axios";
import { useAuthStore } from "@/stores/auth";
/**
 * Single axios instance. Two interceptors attach the auth token and the active
 * organization (the X-Organization header the backend uses to scope tenancy).
 * A 401 clears auth and bounces to login.
 */
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://meeting-ai.test/api",
    headers: { Accept: "application/json" },
});
api.interceptors.request.use((config) => {
    const { token, organizationId } = useAuthStore.getState();
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    if (organizationId)
        config.headers["X-Organization"] = organizationId;
    return config;
});
api.interceptors.response.use((res) => res, (error) => {
    if (error.response?.status === 401) {
        useAuthStore.getState().clear();
        if (!window.location.pathname.startsWith("/login")) {
            window.location.assign("/login");
        }
    }
    return Promise.reject(error);
});

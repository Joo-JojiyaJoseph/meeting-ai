export function formatTime(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
export function formatDate(iso) {
    return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}
export function greeting() {
    const h = new Date().getHours();
    if (h < 12)
        return "Good morning";
    if (h < 18)
        return "Good afternoon";
    return "Good evening";
}

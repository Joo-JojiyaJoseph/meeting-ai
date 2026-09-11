export function formatTime(iso) {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
export function formatDate(iso) {
    return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}
export function formatRelative(iso) {
    if (!iso) return "";
    const ms = Date.now() - new Date(iso).getTime();
    const minutes = Math.round(ms / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
}
export function greeting() {
    const h = new Date().getHours();
    if (h < 12)
        return "Good morning";
    if (h < 18)
        return "Good afternoon";
    return "Good evening";
}

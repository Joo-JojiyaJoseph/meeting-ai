import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, } from "recharts";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BarChart3 } from "lucide-react";
import { useAnalytics } from "./api";
// Brand palette (spec §3) — purple primary, blue secondary, plus supporting hues.
const COLORS = ["#7C3AED", "#2563EB", "#3B82F6", "#A78BFA", "#5B21B6", "#93C5FD"];
const GRID = "#E2E8F0";
const AXIS = "#64748B";
function monthLabel(m) {
    const [, mm] = m.split("-");
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(mm) - 1] ?? m;
}
function ChartCard({ title, children }) {
    return (_jsxs(Card, { className: "p-5", children: [_jsx("h3", { className: "mb-4 font-display font-semibold text-ink", children: title }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: children }) })] }));
}
const tooltipStyle = {
    borderRadius: 12,
    border: `1px solid ${GRID}`,
    boxShadow: "0 8px 24px -12px rgba(15,23,42,0.18)",
    fontSize: 12,
};
export function AnalyticsPage() {
    const { data, isLoading } = useAnalytics();
    if (isLoading) {
        return (_jsxs("div", { className: "mx-auto max-w-7xl", children: [_jsx("h1", { className: "mb-6 font-display text-2xl font-semibold text-ink", children: "Analytics" }), _jsx("div", { className: "grid gap-6 lg:grid-cols-2", children: Array.from({ length: 4 }).map((_, i) => _jsx(Skeleton, { className: "h-72 rounded-2xl" }, i)) })] }));
    }
    if (!data) {
        return (_jsxs("div", { className: "mx-auto max-w-7xl", children: [_jsx("h1", { className: "mb-6 font-display text-2xl font-semibold text-ink", children: "Analytics" }), _jsx(EmptyState, { icon: BarChart3, title: "No analytics yet", description: "Data appears as meetings are held and processed." })] }));
    }
    const months = (s) => s.map((p) => ({ ...p, label: monthLabel(p.month) }));
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "font-display text-2xl font-semibold text-ink", children: "Analytics" }), _jsx("p", { className: "mt-1 text-sm text-ink-soft", children: "Organization-level meeting trends. Descriptive insights, not performance scores." })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [_jsx(ChartCard, { title: "Meetings per month", children: _jsxs(BarChart, { data: months(data.meetings_per_month), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: GRID, vertical: false }), _jsx(XAxis, { dataKey: "label", tick: { fill: AXIS, fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fill: AXIS, fontSize: 12 }, axisLine: false, tickLine: false, allowDecimals: false }), _jsx(Tooltip, { contentStyle: tooltipStyle, cursor: { fill: "#F5F3FF" } }), _jsx(Bar, { dataKey: "value", fill: "#7C3AED", radius: [6, 6, 0, 0], maxBarSize: 28 })] }) }), _jsx(ChartCard, { title: "Meeting hours per month", children: _jsxs(LineChart, { data: months(data.meeting_hours_per_month), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: GRID, vertical: false }), _jsx(XAxis, { dataKey: "label", tick: { fill: AXIS, fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fill: AXIS, fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(Tooltip, { contentStyle: tooltipStyle }), _jsx(Line, { type: "monotone", dataKey: "value", stroke: "#2563EB", strokeWidth: 2.5, dot: { r: 3 } })] }) }), _jsx(ChartCard, { title: "Action item completion", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data.action_item_completion, dataKey: "value", nameKey: "label", innerRadius: 55, outerRadius: 90, paddingAngle: 3, children: data.action_item_completion.map((_, i) => (_jsx(Cell, { fill: [COLORS[0], COLORS[2], "#F59E0B"][i % 3] }, i))) }), _jsx(Tooltip, { contentStyle: tooltipStyle })] }) }), _jsx(ChartCard, { title: "Decisions per month", children: _jsxs(BarChart, { data: months(data.decisions_per_month), children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: GRID, vertical: false }), _jsx(XAxis, { dataKey: "label", tick: { fill: AXIS, fontSize: 12 }, axisLine: false, tickLine: false }), _jsx(YAxis, { tick: { fill: AXIS, fontSize: 12 }, axisLine: false, tickLine: false, allowDecimals: false }), _jsx(Tooltip, { contentStyle: tooltipStyle, cursor: { fill: "#EFF6FF" } }), _jsx(Bar, { dataKey: "value", fill: "#2563EB", radius: [6, 6, 0, 0], maxBarSize: 28 })] }) }), _jsx(ChartCard, { title: "Meetings by department", children: _jsxs(BarChart, { data: data.meetings_by_department, layout: "vertical", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: GRID, horizontal: false }), _jsx(XAxis, { type: "number", tick: { fill: AXIS, fontSize: 12 }, axisLine: false, tickLine: false, allowDecimals: false }), _jsx(YAxis, { type: "category", dataKey: "label", tick: { fill: AXIS, fontSize: 12 }, axisLine: false, tickLine: false, width: 90 }), _jsx(Tooltip, { contentStyle: tooltipStyle, cursor: { fill: "#F5F3FF" } }), _jsx(Bar, { dataKey: "value", fill: "#A78BFA", radius: [0, 6, 6, 0], maxBarSize: 22 })] }) }), _jsx(ChartCard, { title: "Language usage", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data.language_usage, dataKey: "value", nameKey: "label", outerRadius: 90, paddingAngle: 3, children: data.language_usage.map((_, i) => (_jsx(Cell, { fill: COLORS[i % COLORS.length] }, i))) }), _jsx(Tooltip, { contentStyle: tooltipStyle })] }) })] })] }));
}

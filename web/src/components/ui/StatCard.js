import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Card } from "./Card";
const iconTone = {
    brand: "bg-brand-50 text-brand-500",
    info: "bg-blue-50 text-info-500",
    warning: "bg-amber-50 text-amber-600",
};
export function StatCard({ label, value, icon: Icon, tone = "brand", index = 0 }) {
    return (_jsx(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25, delay: index * 0.04 }, children: _jsxs(Card, { className: "p-5", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("span", { className: "text-sm font-medium text-ink-soft", children: label }), _jsx("span", { className: `flex h-9 w-9 items-center justify-center rounded-xl ${iconTone[tone]}`, children: _jsx(Icon, { className: "h-4.5 w-4.5", strokeWidth: 2 }) })] }), _jsx("div", { className: "mt-3 font-display text-3xl font-semibold tabular-nums text-ink", children: value })] }) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function EmptyState({ icon: Icon, title, description, action }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center", children: [_jsx("div", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500", children: _jsx(Icon, { className: "h-6 w-6" }) }), _jsx("h3", { className: "font-display text-lg font-semibold text-ink", children: title }), description && _jsx("p", { className: "mt-1 max-w-sm text-sm text-ink-soft", children: description }), action && _jsx("div", { className: "mt-5", children: action })] }));
}

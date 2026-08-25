import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
export function AppLayout() {
    return (_jsxs("div", { className: "flex min-h-screen bg-canvas", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [_jsx(Topbar, {}), _jsx("main", { className: "flex-1 overflow-y-auto px-4 py-6 lg:px-8", children: _jsx(Outlet, {}) })] })] }));
}

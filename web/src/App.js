import { jsx as _jsx } from "react/jsx-runtime";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { GoogleConnectCallbackPage } from "@/features/auth/GoogleConnectCallbackPage";
import { JoinMeetingPage, EnterJoinCodePage } from "@/features/join/JoinMeetingPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { MeetingsPage } from "@/features/meetings/MeetingsPage";
import { TasksPage } from "@/features/tasks/TasksPage";
import { Skeleton } from "@/components/ui/Skeleton";
// Code-split the heavier routes so Recharts / detail views stay out of the
// initial bundle and load only when their route is visited.
const MeetingDetailPage = lazy(() => import("@/features/meetings/MeetingDetailPage").then((m) => ({ default: m.MeetingDetailPage })));
const CreateMeetingWizard = lazy(() => import("@/features/meetings/CreateMeetingWizard").then((m) => ({ default: m.CreateMeetingWizard })));
const MeetingRoomPage = lazy(() => import("@/features/meetings/MeetingRoomPage").then((m) => ({ default: m.MeetingRoomPage })));
const AssistantPage = lazy(() => import("@/features/assistant/AssistantPage").then((m) => ({ default: m.AssistantPage })));
const AnalyticsPage = lazy(() => import("@/features/analytics/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })));
const ProjectsPage = lazy(() => import("@/features/projects/ProjectsPage").then((m) => ({ default: m.ProjectsPage })));
const MembersPage = lazy(() => import("@/features/members/MembersPage").then((m) => ({ default: m.MembersPage })));
const SearchPage = lazy(() => import("@/features/search/SearchPage").then((m) => ({ default: m.SearchPage })));
const DecisionsPage = lazy(() => import("@/features/decisions/DecisionsPage").then((m) => ({ default: m.DecisionsPage })));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const CalendarPage = lazy(() => import("@/features/calendar/CalendarPage").then((m) => ({ default: m.CalendarPage })));
function Lazy({ children }) {
    return _jsx(Suspense, { fallback: _jsx(Skeleton, { className: "h-96 rounded-2xl" }), children: children });
}
const router = createBrowserRouter([
    { path: "/login", element: _jsx(LoginPage, {}) },
    { path: "/auth/google/callback", element: _jsx(GoogleConnectCallbackPage, {}) },
    { path: "/join", element: _jsx(EnterJoinCodePage, {}) },
    { path: "/join/:shareCode", element: _jsx(JoinMeetingPage, {}) },
    {
        path: "/",
        element: (_jsx(ProtectedRoute, { children: _jsx(AppLayout, {}) })),
        children: [
            { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) },
            { path: "dashboard", element: _jsx(DashboardPage, {}) },
            { path: "meetings", element: _jsx(MeetingsPage, {}) },
            { path: "calendar", element: _jsx(Lazy, { children: _jsx(CalendarPage, {}) }) },
            { path: "meetings/new", element: _jsx(Lazy, { children: _jsx(CreateMeetingWizard, {}) }) },
            { path: "meetings/:id/join", element: _jsx(Lazy, { children: _jsx(MeetingRoomPage, {}) }) },
            { path: "meetings/:id", element: _jsx(Lazy, { children: _jsx(MeetingDetailPage, {}) }) },
            { path: "projects", element: _jsx(Lazy, { children: _jsx(ProjectsPage, {}) }) },
            { path: "tasks", element: _jsx(TasksPage, {}) },
            { path: "decisions", element: _jsx(Lazy, { children: _jsx(DecisionsPage, {}) }) },
            { path: "search", element: _jsx(Lazy, { children: _jsx(SearchPage, {}) }) },
            { path: "assistant", element: _jsx(Lazy, { children: _jsx(AssistantPage, {}) }) },
            { path: "members", element: _jsx(Lazy, { children: _jsx(MembersPage, {}) }) },
            { path: "analytics", element: _jsx(Lazy, { children: _jsx(AnalyticsPage, {}) }) },
            { path: "settings", element: _jsx(Lazy, { children: _jsx(SettingsPage, {}) }) },
        ],
    },
    { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) },
]);
export function App() {
    return _jsx(RouterProvider, { router: router });
}

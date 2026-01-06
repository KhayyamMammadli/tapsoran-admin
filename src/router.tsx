import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "./state/AuthContext";
import { LoginPage } from "./views/LoginPage";
import { AppLayout } from "./views/layout/AppLayout";
import { DashboardPage } from "./views/DashboardPage";
import { CategoriesPage } from "./views/CategoriesPage";
import { RequestsFeedPage } from "./views/RequestsFeedPage";
import { ConversationsPage } from "./views/ConversationsPage";
import { ConversationDetailPage } from "./views/ConversationDetailPage";
import { SettingsPage } from "./views/SettingsPage";
import { UsersPage } from "./views/UsersPage";
import { NotificationsPage } from "./views/NotificationsPage";
import { RiskUsersPage } from "./views/RiskUsersPage";
import { ReportsPage } from "./views/ReportsPage";

function Protected({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <Protected>
        <AppLayout />
      </Protected>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "feed", element: <RequestsFeedPage /> },
      { path: "conversations", element: <ConversationsPage /> },
      { path: "conversations/:id", element: <ConversationDetailPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "safety/risk-users", element: <RiskUsersPage /> },
      { path: "safety/reports", element: <ReportsPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);

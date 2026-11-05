import { AppProvider } from "./store/AppContext";
import { useLocation } from "./router";
import DashboardPage from "./pages/DashboardPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import TasksPage from "./pages/TasksPage";
import PerformancePage from "./pages/PerformancePage";
import DepartmentsPage from "./pages/DepartmentsPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ActivityPage from "./pages/ActivityPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

export const SKILLAI_TABS = [
  ["/", "Dashboard"], ["/approvals", "Approvals"], ["/tasks", "Schedule"], ["/performance", "Performance"],
  ["/departments", "Employees"], ["/reports", "Reports"], ["/activity", "Activity"],
  ["/notifications", "Notifications"], ["/settings", "Settings"], ["/profile", "Profile"],
] as const;

function Page() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/performance")) return <PerformancePage />;
  switch (pathname) {
    case "/approvals": return <ApprovalsPage />;
    case "/tasks": return <TasksPage />;
    case "/departments": return <DepartmentsPage />;
    case "/reports": return <ReportsPage />;
    case "/notifications": return <NotificationsPage />;
    case "/activity": return <ActivityPage />;
    case "/settings": return <SettingsPage />;
    case "/profile": return <ProfilePage />;
    default: return <DashboardPage />;
  }
}

export default function SkillAIApp() {
  return <AppProvider><Page /></AppProvider>;
}

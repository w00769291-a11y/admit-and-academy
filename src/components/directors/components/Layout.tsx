import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Activity, Bell, Building2, CheckSquare, ClipboardList, FileText,
  LayoutDashboard, Search, Settings, Sparkles, UserRound, Users,
} from "lucide-react";
import { useApp } from "../store/AppContext";

const RAIL = [
  { section: "Overview", links: [
    { to: "/directors", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/directors/institute", label: "Institute", icon: Building2, exact: false },
  ] },
  { section: "Management", links: [
    { to: "/directors/departments", label: "Employees", icon: Users, exact: false },
    { to: "/directors/approvals", label: "Approvals", icon: CheckSquare, exact: false },
    { to: "/directors/tasks", label: "Schedule", icon: ClipboardList, exact: false },
    { to: "/directors/performance", label: "Performance", icon: Activity, exact: false },
  ] },
  { section: "Insights", links: [
    { to: "/directors/reports", label: "Reports", icon: FileText, exact: false },
    { to: "/directors/activity", label: "Activity", icon: Activity, exact: false },
    { to: "/directors/skillai", label: "SkillAI", icon: Sparkles, exact: false },
  ] },
] as const;

const TITLES: Record<string, string> = {
  "/directors": "Dashboard",
  "/directors/approvals": "Approvals",
  "/directors/tasks": "Schedule",
  "/directors/performance": "Performance",
  "/directors/institute": "Institute",
  "/directors/departments": "Employees",
  "/directors/reports": "Reports",
  "/directors/notifications": "Notifications",
  "/directors/activity": "Activity",
  "/directors/settings": "Settings",
  "/directors/profile": "Profile",
};

export default function DirectorsLayout() {
  const { settings, notifications, profile, toasts, dismissToast } = useApp()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const unread = notifications.filter(item => !item.read).length
  const title = TITLES[pathname] || (pathname.startsWith("/directors/skillai") ? "SkillAI" : "Dashboard")
  const active = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to)

  return (
    <div className={`app-shell directors-embedded${settings.theme === "dark" ? " dark" : ""}`}>
      <div className="dashboard-device">
        <aside className="device-sidebar" aria-label="Main navigation">
          <Link to="/directors" activeProps={{ className: "" }} className="sidebar-brand">
            <span className="sidebar-brand-icon"><Building2 size={18} /></span>
            <span className="sidebar-brand-copy"><strong>Director’s Office</strong><small>Institute Management</small></span>
          </Link>
          <nav className="sidebar-nav">
            {RAIL.map(group => (
              <div className="sidebar-group" key={group.section}>
                <span className="sidebar-section-label">{group.section}</span>
                {group.links.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeOptions={{ exact: item.exact, includeSearch: false }}
                    activeProps={{ className: "" }}
                    className={`sidebar-link${active(item.to, item.exact) ? " active" : ""}`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <Link to="/directors/settings" className={`sidebar-link${active("/directors/settings", true) ? " active" : ""}`}><Settings size={16} /><span>Settings</span></Link>
            <Link to="/directors/profile" className="sidebar-profile">
              <span className="sidebar-profile-avatar">{profile.name.split(" ").map(part => part[0]).slice(0, 2).join("")}</span>
              <span className="sidebar-profile-copy"><strong>{profile.name}</strong><small>{profile.designation}</small></span>
            </Link>
          </div>
        </aside>

        <div className="device-workspace">
          <header className="device-topbar">
            <h1 className="topbar-title">{title}</h1>
            {searchOpen && <input autoFocus className="device-search" placeholder="Search staff and tasks" aria-label="Search staff and tasks" onKeyDown={event => { if (event.key === "Escape") setSearchOpen(false) }} />}
            <div className="top-actions">
              <button type="button" className="top-icon" title="Search" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}><Search size={15} /></button>
              <Link to="/directors/notifications" className="top-icon notification-action" title="Notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
                <Bell size={15} />{unread > 0 && <span className="notification-dot" />}
              </Link>
              <div className="profile-wrap">
                <button type="button" className="profile-avatar" aria-label="Open profile menu" onClick={() => setProfileOpen(!profileOpen)}>
                  {profile.name.split(" ").map(part => part[0]).slice(0, 2).join("")}
                </button>
                {profileOpen && <div className="profile-menu">
                  <Link to="/directors/profile" onClick={() => setProfileOpen(false)}><UserRound size={14} /> Profile</Link>
                  <Link to="/directors/settings" onClick={() => setProfileOpen(false)}><Settings size={14} /> Settings</Link>
                </div>}
              </div>
            </div>
          </header>
          <main className="device-content" aria-label={title}>
            <Outlet />
          </main>
        </div>
      </div>
      <div className="toast-stack">
        {toasts.map(item => <button type="button" key={item.id} onClick={() => dismissToast(item.id)} className={`dashboard-toast ${item.kind}`} role="status">{item.text}</button>)}
      </div>
    </div>
  )
}

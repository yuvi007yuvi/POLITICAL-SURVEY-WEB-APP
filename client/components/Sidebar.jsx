import {
  BarChart3,
  BarChart4,
  FolderKanban,
  Map,
  ScrollText,
  ShieldCheck,
  X,
  Activity,
  UserCheck,
  History
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const baseLinks = [
  { to: "/", label: "Home", icon: BarChart3, permission: "view_dashboard" },
  { to: "/projects", label: "Projects", icon: FolderKanban, permission: "manage_projects" },
  { to: "/reports", label: "Reports", icon: ScrollText, permission: ["view_all_reports", "view_assigned_reports"] },
  { to: "/kpi-reports", label: "Analytics", icon: BarChart4, permission: "view_all_reports" },
  { to: "/tracking", label: "Map View", icon: Map, permission: ["view_all_reports", "view_assigned_reports"] },
  { to: "/survey-form", label: "New Survey", icon: Activity, permission: "submit_surveys" },
  { to: "/attendance", label: "Mark Attendance", icon: UserCheck, permission: "view_dashboard" },
  { to: "/attendance/logs", label: "Attendance Logs", icon: History, permission: "view_dashboard" },
  { to: "/admin", label: "Settings", icon: ShieldCheck, permission: "manage_roles" },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { session } = useAuth();
  const userPermissions = session?.user?.role?.permissions || [];
  const userRoleKey = session?.user?.role?.key;

  const links = baseLinks.filter((link) => {
    if (!link.permission) return true;
    if (userRoleKey === "super_admin") return true;
    
    const required = Array.isArray(link.permission) ? link.permission : [link.permission];
    return required.some(p => userPermissions.includes(p));
  });

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-900/5 lg:hidden" onClick={onClose} />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-[60] flex w-[86vw] max-w-[320px] flex-col overflow-hidden p-6 transition-all duration-500 lg:sticky lg:top-8 lg:h-[calc(100vh-64px)] lg:w-full lg:max-w-none glass-panel bg-white/80 shadow-xl ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-50 overflow-hidden">
              <img src="/assets/logo.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 font-outfit">Political Soch</p>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 font-outfit">Dashboard</h1>
            </div>
          </div>
          <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 lg:hidden border border-slate-100 transition-all" onClick={onClose}>
            <X size={18} />
          </button>
        </div>



        <nav className="relative flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className={({ isActive }) =>
                `group flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300 ${
                  isActive
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-[1.02]"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? "text-brand-400" : "group-hover:text-brand-500 transition-colors"} />
                  <span className="flex-1 text-[13px] font-bold font-outfit tracking-tight">{label}</span>
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6">
          <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-xs">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900 font-outfit leading-none">{session?.user?.name}</p>
                <p className="truncate text-[10px] font-medium text-slate-400 mt-1">
                  {session?.user?.role?.name || "Member"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

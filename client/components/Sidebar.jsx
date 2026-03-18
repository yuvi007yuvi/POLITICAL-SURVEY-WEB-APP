import { BarChart3, BarChart4, FolderKanban, Map, ScrollText, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const baseLinks = [
  { to: "/", label: "Dashboard", icon: BarChart3, color: "text-teal-600 bg-teal-50" },
  { to: "/admin", label: "Administration", icon: ShieldCheck, color: "text-indigo-600 bg-indigo-50", permission: "manage_roles" },
  { to: "/reports", label: "Reports", icon: ScrollText, color: "text-amber-600 bg-amber-50" },
  { to: "/kpi-reports", label: "KPI Reports", icon: BarChart4, color: "text-rose-600 bg-rose-50" },
  { to: "/tracking", label: "Live Map", icon: Map, color: "text-sky-600 bg-sky-50" },
];

export const Sidebar = () => {
  const { session } = useAuth();
  const userPermissions = session?.user?.role?.permissions || [];
  const userRoleKey = session?.user?.role?.key;

  const links = baseLinks.filter(link => {
    if (!link.permission) return true;
    return userPermissions.includes(link.permission) || userRoleKey === "super_admin";
  });

  return (
    <aside className="sticky top-4 flex h-[calc(100vh-32px)] flex-col gap-6 rounded-none border border-slate-200/60 bg-white p-5 shadow-xl shadow-slate-200/20">
      {/* Logo Section */}
      <div className="flex items-center gap-3.5 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-none bg-brand-50 p-2 border border-brand-100">
          <img src="/assets/logo.png" alt="Logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <h1 className="text-[15px] font-extrabold tracking-tight text-surface-800">Political Soch</h1>
          <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Command Center</p>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5">
        {links.map(({ to, label, icon: Icon, color }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `group relative flex items-center gap-3.5 rounded-none px-4 py-3 text-[13px] font-semibold transition-all duration-300 ${isActive
                ? "bg-brand-50 text-brand-600 border border-brand-100/50"
                : "text-surface-500 hover:bg-slate-50 hover:text-surface-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? "text-brand-600" : "text-surface-400 group-hover:text-surface-600"} />
                <span>{label}</span>
                {to === "/tracking" && (
                  <span className="ml-auto flex h-1.5 w-1.5 rounded-none bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                )}
                {isActive && (
                  <div className="absolute -left-1 h-6 w-1 rounded-none bg-brand-600" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Account Info / Footer */}
      <div className="mt-auto space-y-4">
        <div className="rounded-none bg-slate-50 p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-brand-600 text-[10px] font-bold text-white shadow-inner">
              {session?.user?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-surface-800">{session?.user?.name}</p>
              <p className="truncate text-[9px] font-medium text-surface-400 uppercase tracking-tighter">
                {session?.user?.role?.name || "Member"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span>Powered by</span>
            <span className="text-brand-500">v2.4.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

import { BarChart3, FolderKanban, Map, ScrollText, ShieldCheck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const baseLinks = [
  { to: "/", label: "Dashboard", icon: BarChart3, color: "text-teal-600 bg-teal-50" },
  { to: "/projects", label: "Projects", icon: FolderKanban, color: "text-violet-600 bg-violet-50" },
  { to: "/users", label: "Users", icon: Users, color: "text-blue-600 bg-blue-50" },
  { to: "/roles", label: "Roles", icon: ShieldCheck, color: "text-indigo-600 bg-indigo-50", permission: "manage_roles" },
  { to: "/reports", label: "Reports", icon: ScrollText, color: "text-amber-600 bg-amber-50" },
  { to: "/tracking", label: "Tracking", icon: Map, color: "text-emerald-600 bg-emerald-50" }
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
    <aside className="sticky top-4 flex h-[calc(100vh-32px)] flex-col gap-6 rounded-none border border-slate-200/60 bg-slate-900 p-5 shadow-2xl shadow-slate-900/10">
      {/* Logo Section */}
      <div className="flex items-center gap-3.5 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-none bg-white/10 p-2 backdrop-blur-sm">
          <img src="/assets/logo.png" alt="Logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <h1 className="text-[15px] font-extrabold tracking-tight text-white">Political Soch</h1>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Command Center</p>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50" />

      {/* Navigation */}
      <nav className="flex flex-col gap-1.5">
        {links.map(({ to, label, icon: Icon, color }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `group relative flex items-center gap-3.5 rounded-none px-4 py-3 text-[13px] font-semibold transition-all duration-300 ${isActive
                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"} />
                <span>{label}</span>
                {to === "/tracking" && (
                  <span className="ml-auto flex h-1.5 w-1.5 rounded-none bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                )}
                {isActive && (
                  <div className="absolute -left-1 h-6 w-1 rounded-none bg-white opacity-20" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Account Info / Footer */}
      <div className="mt-auto space-y-4">
        <div className="rounded-none bg-white/5 p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-none bg-brand-500 text-[10px] font-bold text-white shadow-inner">
              {session?.user?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold text-white">{session?.user?.name}</p>
              <p className="truncate text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
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

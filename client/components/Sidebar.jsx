import { BarChart3, FolderKanban, Map, ScrollText, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/users", label: "Users", icon: Users },
  { to: "/reports", label: "Reports", icon: ScrollText },
  { to: "/tracking", label: "Tracking", icon: Map }
];

export const Sidebar = () => (
  <aside className="panel flex h-full flex-col gap-4 bg-brand-900 text-white">
    <div>
      <p className="text-sm uppercase tracking-[0.3em] text-brand-100">Political Soch</p>
      <h1 className="mt-2 text-2xl font-bold">Operations Hub</h1>
    </div>
    <nav className="flex flex-col gap-2">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
              isActive ? "bg-white text-brand-900" : "text-brand-50 hover:bg-brand-700"
            }`
          }
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);


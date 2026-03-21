import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronDown, Filter, LogOut, Menu, Search } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { projectService } from "../services/projectService.js";

export const DashboardLayout = () => {
  const { logout, session } = useAuth();
  const location = useLocation();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.list
  });

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === "/") return "Overview";
    if (path === "/admin") return "Settings";
    if (path === "/reports") return "Reports";
    if (path === "/kpi-reports") return "Analytics";
    if (path === "/tracking") return "Live Map";
    if (path.includes("/projects")) return "Project Details";
    return "Dashboard";
  };

  return (
    <div className="relative h-screen overflow-hidden bg-white flex flex-col">
      {/* Subtle Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-0 top-0 h-[500px] w-full bg-gradient-to-b from-brand-50/20 to-transparent" />
        <div className="absolute inset-0 glass-grid opacity-[0.2]" />
      </div>

      <div className="flex-1 mx-auto grid w-full max-w-[1600px] gap-6 lg:grid-cols-[280px_1fr] relative z-10 overflow-hidden p-2 sm:p-4 lg:p-6">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="relative flex flex-col min-h-0 min-w-0 animate-fadeIn overflow-hidden">
          {/* Mobile Header */}
          <div className="p-4 flex lg:hidden items-center justify-between gap-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm">
            <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-brand-500 text-white active:scale-95 transition-all shadow-lg shadow-brand-500/20" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-950 font-outfit tracking-tight capitalize">{getBreadcrumb()}</p>
            </div>
          </div>

          {/* Desktop Header */}
          <header className="hidden lg:block">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-2 w-2 rounded-full bg-brand-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 font-outfit">Live Updates</p>
                </div>
                <h2 className="text-4xl font-bold text-slate-950 font-outfit tracking-tight leading-none">{getBreadcrumb()}</h2>
              </div>

              <div className="flex flex-wrap items-center gap-4">


                {/* Project Filter */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Filter size={16} className="text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                  </div>
                  <select
                    value={selectedProjectId}
                    onChange={(event) => setSelectedProjectId(event.target.value)}
                    className="h-14 pl-12 pr-12 rounded-3xl border-2 border-slate-50 bg-slate-50/50 outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-bold text-slate-900 appearance-none cursor-pointer font-outfit tracking-tight"
                  >
                    <option value="">All Projects</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                    <ChevronDown size={14} className="text-slate-400" />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-1.5 rounded-3xl bg-slate-50 border border-slate-100">
                  <button className="h-11 w-11 flex items-center justify-center rounded-2xl bg-white text-slate-400 hover:text-brand-600 transition-all border border-slate-100 shadow-sm">
                    <Bell size={18} />
                  </button>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="flex items-center gap-3 pl-2 pr-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500 text-xs font-bold text-white shadow-lg shadow-brand-500/10">
                      {session?.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-bold text-slate-950 font-outfit tracking-tight leading-none">{session?.user?.name}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-widest text-slate-400 font-bold font-outfit">
                        {session?.user?.role?.name || "Admin"}
                      </p>
                    </div>
                  </div>
                </div>

                <button className="h-14 w-14 flex items-center justify-center rounded-3xl bg-white border border-slate-100 text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-sm" onClick={logout} title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 soft-scroll mt-6 pb-10 min-w-0">
            <div className="animate-fadeIn relative">
              <Outlet context={{ selectedProjectId }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

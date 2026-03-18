import { useQuery } from "@tanstack/react-query";
import { LogOut, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { projectService } from "../services/projectService.js";

export const DashboardLayout = () => {
  const { logout, session } = useAuth();
  const location = useLocation();
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.list
  });

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/admin") return "Administration";
    if (path === "/reports") return "Reports";
    if (path === "/kpi-reports") return "KPI Dashboard";
    if (path === "/tracking") return "Live Map";
    if (path.includes("/projects")) return "Project Orchestration";
    return "Control Center";
  };

  return (
    <div className="min-h-screen bg-surface-100 p-4 lg:p-6 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.06] z-0">
        <img src="/assets/logo.png" alt="Watermark" className="w-[600px]" />
      </div>

      <div className="mx-auto grid max-w-[1536px] gap-6 lg:grid-cols-[280px_1fr] relative z-10">
        <Sidebar />
        <main className="space-y-6">
          {/* Top Bar / Header */}
          <header className="flex h-16 items-center justify-between rounded-none border border-white/40 bg-white/70 px-6 py-3 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 border-r border-surface-100 pr-6 mr-2">
                <span className="text-brand-500 font-bold text-lg leading-none">&gt;</span>
                <span className="text-[14px] font-bold text-surface-500 uppercase tracking-widest">{getBreadcrumb()}</span>
              </div>

              {/* Global Project Selector */}
              <div className="hidden md:flex items-center gap-3">
                <div className="h-9 border border-surface-200 bg-white px-3 flex items-center gap-2 group focus-within:border-brand-500 transition-colors shadow-sm">
                  <Filter size={12} className="text-surface-400 group-focus-within:text-brand-500 font-bold" />
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-surface-700 outline-none cursor-pointer pr-4 border-none focus:ring-0"
                  >
                    <option value="">Global Overview</option>
                    {projects?.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
                <div className="flex h-8 w-8 items-center justify-center bg-slate-950 text-white text-[10px] font-black overflow-hidden shadow-lg border-2 border-brand-500/20">
                  {session?.user?.profilePhoto ? (
                    <img src={session.user.profilePhoto} alt="User" className="h-full w-full object-cover" />
                  ) : (
                    session?.user?.name?.charAt(0) || "U"
                  )}
                </div>
                <div className="hidden lg:block text-left">
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none">{session?.user?.name}</p>
                   <p className="text-[8px] font-bold text-brand-600 uppercase tracking-widest mt-0.5">{session?.user?.role?.name || "Admin"}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="group flex items-center gap-2.5 rounded-none px-3 py-2 text-xs font-semibold text-surface-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-none bg-surface-100 group-hover:bg-rose-100 transition-colors">
                  <LogOut size={13} />
                </div>
                Logout
              </button>
            </div>
          </header>


          <div className="animate-fadeIn">
            <Outlet context={{ selectedProjectId }} />
          </div>
        </main>
      </div>
    </div>
  );
};

import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { LogOut } from "lucide-react";

export const DashboardLayout = () => {
  const { logout, session } = useAuth();

  return (
    <div className="min-h-screen bg-surface-100 p-4 lg:p-6">
      <div className="mx-auto grid max-w-[1536px] gap-6 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <main className="space-y-6">
          {/* Top Bar / Header */}
          <header className="flex h-16 items-center justify-between rounded-none border border-white/40 bg-white/70 px-6 py-3 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-extrabold tracking-tight text-surface-900">
                Political <span className="text-brand-600">Soch</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
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
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

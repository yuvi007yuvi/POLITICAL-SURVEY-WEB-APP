import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar.jsx";
import { useAuth } from "../hooks/useAuth.jsx";

export const DashboardLayout = () => {
  const { logout, session } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <main className="space-y-6">
          <section className="panel flex flex-col justify-between gap-4 bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white sm:flex-row">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand-100">Admin Console</p>
              <h2 className="mt-2 text-3xl font-bold">Field Intelligence Dashboard</h2>
              <p className="mt-2 max-w-2xl text-sm text-brand-50">
                Review survey inflow, coordinate field teams, and verify evidence from one place.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white/15 px-4 py-3">
                <p className="text-sm text-brand-50">{session?.user?.name}</p>
                <p className="text-xs uppercase tracking-wide text-brand-100">{session?.user?.role}</p>
              </div>
              <button className="button-secondary bg-white text-brand-900" onClick={logout}>
                Logout
              </button>
            </div>
          </section>
          <Outlet />
        </main>
      </div>
    </div>
  );
};


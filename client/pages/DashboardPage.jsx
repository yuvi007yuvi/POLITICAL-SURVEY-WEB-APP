import { useQuery } from "@tanstack/react-query";
import { Activity, FileText, FolderKanban, Users } from "lucide-react";
import { StatCard } from "../components/StatCard.jsx";
import { dashboardService } from "../services/dashboardService.js";

export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.stats
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="panel">
              <div className="skeleton h-3 w-20 mb-3" />
              <div className="skeleton h-6 w-14 mb-2" />
              <div className="skeleton h-3 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Control Center Header */}
      <div className="relative overflow-hidden rounded-none bg-surface-900 p-8 text-white shadow-2xl shadow-slate-900/10">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_top_right,rgba(20,184,166,0.3),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(67,97,238,0.2),transparent_40%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">System Overview 🎯</h2>
            <p className="mt-2 max-w-md text-sm font-medium text-slate-400 leading-relaxed">
              Welcome back. You are viewing live metrics across all active field operations and survey programs.
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-none bg-white/10 backdrop-blur-md outline outline-1 outline-white/20">
            <Activity className="text-brand-400" size={32} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Users"
          value={data.totalUsers}
          helper="Available field force"
          icon={Users}
          color="blue"
          trend={12}
          trendLabel="MoM"
        />
        <StatCard
          title="Live Projects"
          value={data.totalProjects}
          helper={`${data.activeProjects} in rollout`}
          icon={FolderKanban}
          color="purple"
          trend={8}
        />
        <StatCard
          title="Submissions"
          value={data.totalSurveys}
          helper="Total records captured"
          icon={FileText}
          color="success"
          trend={24}
          trendLabel="WTD"
        />
        <StatCard
          title="Activity Log"
          value={data.recentSurveys.length}
          helper="New since last 24h"
          icon={Activity}
          color="brand"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Recent Submissions */}
        <div className="panel shadow-panel">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider">Recent Activity</h3>
              <p className="text-[11px] font-medium text-surface-400">Latest field data captures</p>
            </div>
            <span className="badge-brand">{data.recentSurveys.length} New Feed</span>
          </div>

          <div className="divide-y divide-surface-100">
            {data.recentSurveys.map((survey, index) => (
              <div
                key={survey._id}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group hover:px-2 transition-all duration-200 rounded-none"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-surface-50 text-[12px] font-extrabold text-surface-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    {survey.userId?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-800">{survey.projectId?.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-surface-400">{survey.userId?.name}</span>
                      <span className="h-1 w-1 rounded-none bg-surface-200" />
                      <span className="text-[11px] font-bold text-brand-500 uppercase tracking-tighter">Verified</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-surface-400 tabular-nums">
                    {new Date(survey.submittedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-[10px] font-medium text-surface-300 uppercase tracking-widest">
                    {new Date(survey.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Throughput */}
        <div className="panel shadow-panel">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider">Project Velocity</h3>
            <p className="text-[11px] font-medium text-surface-400">Submissions per project volume</p>
          </div>

          <div className="space-y-5">
            {data.surveysPerProject.map((item, index) => {
              const maxWidth = Math.min(item.submissions * 10, 100);
              const barColors = [
                "bg-brand-500",
                "bg-blue-500",
                "bg-indigo-500",
                "bg-violet-500",
                "bg-purple-500"
              ];
              return (
                <div key={item.projectId} className="group cursor-default">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-surface-600 transition-colors group-hover:text-brand-600">
                      {item.projectName}
                    </span>
                    <span className="text-[11px] font-extrabold text-surface-400 tabular-nums">{item.submissions}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-none bg-surface-100">
                    <div
                      className={`h-full rounded-none ${barColors[index % barColors.length]} opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out`}
                      style={{ width: `${maxWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-none bg-surface-50 p-4 border border-dashed border-surface-200 text-center">
            <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider italic">
              "Efficiency is doing things right; effectiveness is doing the right things."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

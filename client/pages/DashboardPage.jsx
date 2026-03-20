import { useQuery } from "@tanstack/react-query";
import { Activity, FileText, FolderKanban, Users } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { StatCard } from "../components/StatCard.jsx";
import { dashboardService } from "../services/dashboardService.js";
import { AnalysisDetails } from "../components/AnalysisDetails.jsx";

export const DashboardPage = () => {
  const { selectedProjectId } = useOutletContext();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats", selectedProjectId],
    queryFn: () => dashboardService.stats(selectedProjectId)
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
    <section className="space-y-6 animate-fadeIn pb-8">
      {/* Control Center Header */}
      <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 sm:p-8 text-surface-800 shadow-2xl shadow-emerald-900/5">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(52,211,153,0.1),transparent_40%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-surface-800">
              Political <span className="text-brand-600">Soch</span>
            </h1>
            <p className="mt-2 max-w-md text-sm font-medium text-slate-600 leading-relaxed">
              Welcome back. You are viewing live metrics across all active field operations and survey programs.
            </p>
          </div>
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-none bg-white/50 backdrop-blur-md outline outline-1 outline-white/80 shrink-0">
            <Activity className="text-brand-400" size={24} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Advanced Analysis Details - Might need its own responsiveness check internaly */}
      <AnalysisDetails data={data} />

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_380px]">
        {/* Recent Submissions */}
        <div className="panel shadow-panel overflow-x-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider">Recent Activity</h3>
              <p className="text-[11px] font-medium text-surface-400">Latest field data captures</p>
            </div>
            <span className="badge-brand self-start sm:self-auto">{data.recentSurveys.length} New Feed</span>
          </div>

          <div className="divide-y divide-surface-100 min-w-0">
            {data.recentSurveys.map((survey, index) => (
              <div
                key={survey._id}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group hover:px-2 transition-all duration-200 rounded-none gap-4"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-none bg-surface-50 text-[12px] font-extrabold text-surface-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    {survey.userId?.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-surface-800 truncate">{survey.projectId?.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-surface-400 truncate">{survey.userId?.name}</span>
                      <span className="hidden sm:inline h-1 w-1 rounded-none bg-surface-200" />
                      <span className="hidden sm:inline text-[11px] font-bold text-brand-500 uppercase tracking-tighter">Verified</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
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

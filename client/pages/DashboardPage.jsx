import { useQuery } from "@tanstack/react-query";
import { Activity, BarChart4, FileText, FolderKanban, Radar, Users, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { AnalysisDetails } from "../components/AnalysisDetails.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { dashboardService } from "../services/dashboardService.js";

export const DashboardPage = () => {
  const { selectedProjectId } = useOutletContext();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats", selectedProjectId],
    queryFn: () => dashboardService.stats(selectedProjectId)
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-[300px] rounded-[40px] bg-slate-50" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-[32px] bg-slate-50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-10 pb-16">
      {/* Friendly Hero Section - Minimal & Light */}
      <section className="relative overflow-hidden rounded-[24px] bg-brand-50 px-6 py-5 border border-brand-100 shadow-sm">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 right-0 h-32 w-32 bg-brand-200 rounded-full blur-[40px] -mr-8 -mt-8" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <Sparkles size={10} className="text-brand-600" />
               <p className="text-[8px] font-bold uppercase tracking-widest text-brand-400">Overview</p>
            </div>
            <h1 className="text-xl font-bold font-outfit tracking-tight text-slate-900">
              Welcome back, <span className="text-brand-600">here's what's happening.</span>
            </h1>
          </div>
          
          <div className="flex gap-2.5">
            <button 
              onClick={() => navigate("/projects")}
              className="h-9 px-4 rounded-lg bg-brand-500 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus size={14} />
              Projects
            </button>
            <button 
              onClick={() => navigate("/tracking")}
              className="h-9 px-4 rounded-lg bg-white text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2 border border-slate-200"
            >
              <Radar size={14} />
              Map
            </button>
          </div>
        </div>
      </section>

      {/* Main Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          helper="All registered members"
          icon={Users}
          color="blue"
          trend={12}
        />
        <StatCard
          title="Active Projects"
          value={data.totalProjects}
          helper={`${data.activeProjects} projects running`}
          icon={FolderKanban}
          color="purple"
          trend={5}
        />
        <StatCard
          title="Total Reports"
          value={data.totalSurveys}
          helper="Submissions collected"
          icon={FileText}
          color="success"
          trend={24}
        />
        <StatCard
          title="Today's Updates"
          value={data.recentSurveys.length}
          helper="New reports last 24h"
          icon={Activity}
          color="brand"
        />
      </div>

      <AnalysisDetails data={data} />

      {/* Secondary Content Area */}
      <div className="grid gap-10 xl:grid-cols-2">
        {/* Recent Activity List */}
        <div className="glass-panel p-10 bg-white/70 border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-bold font-outfit tracking-tight text-slate-950">Recent Activity</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Lately submitted reports from the field</p>
            </div>
            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
               <Activity size={20} />
            </div>
          </div>

          <div className="space-y-4">
            {data.recentSurveys.length ? (
              data.recentSurveys.map((survey) => (
                <div
                  key={survey._id}
                  className="group flex items-center justify-between p-5 rounded-3xl border border-slate-50 bg-white hover:border-brand-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-900 font-bold text-sm border border-slate-100">
                      {survey.userId?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-950">{survey.projectId?.name || "General Survey"}</p>
                      <p className="text-xs text-slate-400 mt-1">Submitted by {survey.userId?.name || "Member"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-950">
                      {new Date(survey.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Verified</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
                <p className="text-sm font-medium text-slate-400">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Project Progress */}
        <div className="glass-panel p-10 bg-white/70 border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-bold font-outfit tracking-tight text-slate-950">Project Status</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Current progress across active projects</p>
            </div>
            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
               <BarChart4 size={20} />
            </div>
          </div>

          <div className="space-y-6">
            {data.surveysPerProject.length ? (
              data.surveysPerProject.map((item) => {
                const percent = Math.min(item.submissions * 8, 100);
                return (
                  <div key={item.projectId} className="space-y-4 p-5 rounded-3xl bg-white border border-slate-50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-950">{item.projectName}</p>
                      <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">{item.submissions} Reports</span>
                    </div>
                    <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-brand-500 rounded-full transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
                 <p className="text-sm font-medium text-slate-400">No projects to display.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Plus = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

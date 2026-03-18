import { useQuery } from "@tanstack/react-query";
import { StatCard } from "../components/StatCard.jsx";
import { dashboardService } from "../services/dashboardService.js";

export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.stats
  });

  if (isLoading) {
    return <div className="panel">Loading dashboard...</div>;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active Users" value={data.totalUsers} helper="Survey users available for assignment" />
        <StatCard title="Projects" value={data.totalProjects} helper={`${data.activeProjects} active project(s)`} />
        <StatCard title="Survey Submissions" value={data.totalSurveys} helper="Captured from field teams" />
        <StatCard title="Recent Activity" value={data.recentSurveys.length} helper="Last ten submissions snapshot" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="panel">
          <h3 className="text-lg font-semibold">Recent submissions</h3>
          <div className="mt-4 space-y-4">
            {data.recentSurveys.map((survey) => (
              <div key={survey._id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{survey.projectId?.name}</p>
                    <p className="text-sm text-slate-500">{survey.userId?.name}</p>
                  </div>
                  <p className="text-sm text-slate-500">{new Date(survey.submittedAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3 className="text-lg font-semibold">Project throughput</h3>
          <div className="mt-4 space-y-4">
            {data.surveysPerProject.map((item) => (
              <div key={item.projectId}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{item.projectName}</span>
                  <span>{item.submissions}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-brand-700"
                    style={{ width: `${Math.min(item.submissions * 10, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation, Activity, CheckCircle2, Filter, Calendar } from "lucide-react";
import { StatCard } from "../components/StatCard.jsx";
import { SurveyMap } from "../components/SurveyMap.jsx";
import { reportService } from "../services/reportService.js";
import { projectService } from "../services/projectService.js";

export const MapTrackingPage = () => {
  const [projectId, setProjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: projectsData } = useQuery({
    queryKey: ["projects-list"],
    queryFn: () => projectService.list()
  });

  const { data, isLoading } = useQuery({
    queryKey: ["tracking-map", projectId, date],
    queryFn: () => reportService.list({ page: 1, projectId, date })
  });

  const points = (data?.items || [])
    .filter((item) => item.gpsLocation?.coordinates?.length === 2)
    .map((item) => ({
      id: item._id,
      project: item.projectId?.name,
      user: item.userId?.name,
      submittedAt: new Date(item.submittedAt).toLocaleString(),
      latitude: item.gpsLocation.coordinates[1],
      longitude: item.gpsLocation.coordinates[0]
    }));

  return (
    <section className="space-y-8 pb-12">
      {/* Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatCard
          title="Total Locations"
          value={points.length}
          helper={date ? `Reports on ${new Date(date).toLocaleDateString()}` : "Filtered reports"}
          icon={MapPin}
          color="brand"
        />
        <StatCard
          title="Last Update"
          value={
            points.length > 0
              ? new Date(points[0].submittedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })
              : "No Data"
          }
          helper="Latest pinpointed activity"
          icon={Navigation}
          color="accent"
        />
      </div>

      {/* Header & Filters */}
      <div className="space-y-6">
        <div className="glass-panel p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-slate-100 bg-white shadow-xl">
          <div className="flex items-center gap-6">
              <div className="h-14 w-14 flex items-center justify-center rounded-3xl bg-brand-500 text-white shadow-lg">
                  <MapPin size={24} />
              </div>
              <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 font-outfit">Geospatial Insights</p>
                  <h2 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Activity Map</h2>
              </div>
          </div>
          
          <div className={`px-6 py-2.5 rounded-full border flex items-center gap-3 shadow-sm transition-all ${!projectId && !date ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-brand-50 border-brand-100 text-brand-600'}`}>
               <div className={`h-2 w-2 rounded-full animate-pulse ${!projectId && !date ? 'bg-emerald-500' : 'bg-brand-500'}`} />
               <span className="text-[10px] font-bold uppercase tracking-widest font-outfit">
                 {projectId || date ? 'Filtered View' : 'Live Global Feed'}
               </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 border border-slate-100 shadow-lg rounded-[32px] flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <Filter size={14} className="text-slate-400" />
                <select 
                    className="bg-transparent text-[11px] font-bold text-slate-900 outline-none min-w-[150px]"
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                >
                    <option value="">All Projects</option>
                    {projectsData?.items?.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <Calendar size={14} className="text-slate-400" />
                <input 
                    type="date"
                    className="bg-transparent text-[11px] font-bold text-slate-900 outline-none"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />
            </div>

            {(projectId || date) && (
                <button 
                    onClick={() => { setProjectId(""); setDate(""); }}
                    className="text-[10px] font-bold text-brand-500 uppercase tracking-widest hover:text-brand-600 transition-all ml-auto pr-4"
                >
                    Clear Filters
                </button>
            )}
        </div>
      </div>

      {/* Map View */}
      <div className="bg-white p-3 border border-slate-100 shadow-2xl overflow-hidden rounded-[40px]">
        <div className="w-full rounded-[32px] overflow-hidden border border-slate-50 min-h-[600px] relative">
            {isLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 gap-4">
                    <div className="h-10 w-10 border-4 border-slate-100 border-t-brand-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Updating map data...</p>
                </div>
            ) : null}
            <SurveyMap points={points} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 flex items-start gap-6 hover:shadow-lg transition-all">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <Activity size={24} />
                </div>
                <div className="space-y-1">
                    <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest font-outfit">Spatial Distribution</h5>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        {points.length > 0 
                            ? `Visualizing ${points.length} active points across the region for your selected criteria.`
                            : "No geographical data matches your current filter selection."}
                    </p>
                </div>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 flex items-start gap-6 hover:shadow-lg transition-all">
                <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <CheckCircle2 size={24} />
                </div>
                <div className="space-y-1">
                    <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest font-outfit">Data Integrity</h5>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        GPS metadata is verified for all mapped reports. Coordinates are captured directly from field devices.
                    </p>
                </div>
          </div>
      </div>
    </section>
  );
};

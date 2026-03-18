import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation } from "lucide-react";
import { StatCard } from "../components/StatCard.jsx";
import { SurveyMap } from "../components/SurveyMap.jsx";
import { reportService } from "../services/reportService.js";

export const MapTrackingPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["tracking-map"],
    queryFn: () => reportService.list({ page: 1 })
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

  if (isLoading) {
    return (
      <div className="panel">
        <div className="skeleton h-5 w-40 mb-3" />
        <div className="skeleton h-[400px] w-full rounded-none" />
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Header Stats */}
      <div className="grid gap-5 md:grid-cols-2">
        <StatCard
          title="Telemetry Nodes"
          value={points.length}
          helper="GPS-tagged active submissions"
          icon={MapPin}
          color="brand"
        />
        <StatCard
          title="Last Signal"
          value={points.length > 0 ? new Date(points[0].submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
          helper="Most recent evidence capture"
          icon={Navigation}
          color="accent"
        />
      </div>

      {/* Map Header */}
      <div className="panel shadow-panel flex items-center gap-4 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-none bg-brand-50 text-brand-600 shadow-inner">
          <MapPin size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-surface-900">Geospatial Intelligence</h3>
          <p className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">Field Asset Tracking & Survey Localization</p>
        </div>
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-[2rem] border border-surface-200/60 shadow-panel bg-white p-2">
        <div className="rounded-[1.5rem] overflow-hidden">
          <SurveyMap points={points} />
        </div>
      </div>
    </section>
  );
};

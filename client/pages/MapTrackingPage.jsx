import { useQuery } from "@tanstack/react-query";
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
    return <div className="panel">Loading map...</div>;
  }

  return (
    <section className="space-y-4">
      <div className="panel">
        <h3 className="text-xl font-semibold">Map tracking</h3>
        <p className="mt-2 text-sm text-slate-500">Survey submission coordinates rendered with OpenStreetMap and Leaflet.</p>
      </div>
      <SurveyMap points={points} />
    </section>
  );
};


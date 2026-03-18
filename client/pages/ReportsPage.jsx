import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable.jsx";
import { reportService } from "../services/reportService.js";
import { exportReportsToExcel, exportReportsToPdf } from "../utils/export.js";

export const ReportsPage = () => {
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["reports", page],
    queryFn: () => reportService.list({ page })
  });

  const rows = useMemo(
    () =>
      (data?.items || []).map((item) => ({
        id: item._id,
        project: item.projectId?.name,
        user: item.userId?.name,
        submittedAt: new Date(item.submittedAt).toLocaleString(),
        latitude: item.gpsLocation?.coordinates?.[1] || 0,
        longitude: item.gpsLocation?.coordinates?.[0] || 0,
        photos: item.photos?.length || 0,
        voice: item.voiceRecording?.url ? "Yes" : "No"
      })),
    [data]
  );

  const columns = [
    { key: "project", label: "Project" },
    { key: "user", label: "User" },
    { key: "submittedAt", label: "Submitted At" },
    { key: "photos", label: "Photos" },
    { key: "voice", label: "Voice" }
  ];

  if (isLoading) {
    return <div className="panel">Loading reports...</div>;
  }

  return (
    <section className="space-y-4">
      <div className="panel flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-semibold">Survey reports</h3>
          <p className="mt-2 text-sm text-slate-500">Review submissions, evidence availability, and export summaries.</p>
        </div>
        <div className="flex gap-3">
          <button className="button-secondary" onClick={() => exportReportsToExcel(rows)}>
            Export Excel
          </button>
          <button className="button-primary" onClick={() => exportReportsToPdf(rows)}>
            Export PDF
          </button>
        </div>
      </div>
      <DataTable columns={columns} rows={rows} />
    </section>
  );
};


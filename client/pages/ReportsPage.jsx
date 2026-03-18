import { useQuery } from "@tanstack/react-query";
import { Camera, Download, FileSpreadsheet, FileText, Mic } from "lucide-react";
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DataTable } from "../components/DataTable.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { reportService } from "../services/reportService.js";
import { exportReportsToExcel, exportReportsToPdf } from "../utils/export.js";

export const ReportsPage = () => {
  const { selectedProjectId } = useOutletContext();
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["reports", page, selectedProjectId],
    queryFn: () => reportService.list({ page, projectId: selectedProjectId })
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

  const withPhotos = rows.filter((r) => r.photos > 0).length;
  const withVoice = rows.filter((r) => r.voice === "Yes").length;

  const columns = [
    {
      key: "project",
      label: "Project",
      render: (row) => <span className="font-medium text-surface-800">{row.project}</span>
    },
    { key: "user", label: "Surveyor" },
    {
      key: "submittedAt",
      label: "Date",
      render: (row) => <span className="text-xs tabular-nums text-surface-500">{row.submittedAt}</span>
    },
    {
      key: "photos",
      label: "Photos",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Camera size={13} className="text-surface-400" />
          <span className={row.photos > 0 ? "font-semibold text-surface-700" : "text-surface-300"}>{row.photos}</span>
        </div>
      )
    },
    {
      key: "voice",
      label: "Voice",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Mic size={13} className="text-surface-400" />
          <span className={row.voice === "Yes" ? "badge-success" : "badge-neutral"}>{row.voice}</span>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="panel">
        <div className="skeleton h-5 w-40 mb-3" />
        <div className="skeleton h-3 w-72" />
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Summary Stats */}
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard title="Total Submissions" value={rows.length} icon={FileText} color="brand" helper="Aggregated platform data" />
        <StatCard title="Visual Evidence" value={withPhotos} icon={Camera} color="accent" helper="Submissions with imagery" />
        <StatCard title="Audio Evidence" value={withVoice} icon={Mic} color="success" helper="Submissions with voice" />
      </div>

      {/* Header */}
      <div className="panel shadow-panel flex flex-col justify-between gap-4 sm:flex-row sm:items-center py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-none bg-brand-50 text-brand-600 shadow-inner">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-900">Intelligence Reports</h3>
            <p className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">Review submissions and export summaries</p>
          </div>
        </div>
        <div className="flex gap-2.5">
          <button className="button-secondary h-10 px-5 text-xs font-bold transition-all hover:bg-surface-100" onClick={() => exportReportsToExcel(rows)}>
            <FileSpreadsheet size={15} />
            Export Excel
          </button>
          <button className="button-primary h-10 px-5 text-xs font-bold shadow-lg shadow-brand-500/20" onClick={() => exportReportsToPdf(rows)}>
            <Download size={15} />
            Generate PDF
          </button>
        </div>
      </div>

      <DataTable columns={columns} rows={rows} />
    </section>
  );
};

import { useQuery } from "@tanstack/react-query";
import { Camera, Download, FileSpreadsheet, FileText, Mic, CheckCircle2, Search, Eye, X, MapPin, Calendar, User, Table as TableIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DataTable } from "../components/DataTable.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { reportService } from "../services/reportService.js";
import { projectService } from "../services/projectService.js";
import { exportReportsToExcel, exportReportsToPdf } from "../utils/export.js";

export const ReportsPage = () => {
  const { selectedProjectId } = useOutletContext();
  const [page] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch project details for dynamic headers
  const { data: project } = useQuery({
    queryKey: ["project", selectedProjectId],
    queryFn: () => projectService.get(selectedProjectId),
    enabled: !!selectedProjectId
  });

  const { data, isLoading } = useQuery({
    queryKey: ["reports", page, selectedProjectId],
    queryFn: () => reportService.list({ page, projectId: selectedProjectId })
  });

  const allRows = useMemo(
    () =>
      (data?.items || []).map((item) => ({
        ...item,
        id: item._id,
        projectName: item.projectId?.name,
        userName: item.userId?.name,
        displayDate: new Date(item.submittedAt).toLocaleString(),
        latitude: item.gpsLocation?.coordinates?.[1] || 0,
        longitude: item.gpsLocation?.coordinates?.[0] || 0,
        photosCount: item.photos?.length || 0,
        voiceStatus: item.voiceRecording?.url ? "Yes" : "No"
      })),
    [data]
  );

  const rows = useMemo(() => 
    allRows.filter(r => 
        r.userName?.toLowerCase().includes(search.toLowerCase()) || 
        r.projectName?.toLowerCase().includes(search.toLowerCase())
    ), [allRows, search]
  );

  const withPhotos = rows.filter((row) => row.photosCount > 0).length;
  const withVoice = rows.filter((row) => row.voiceStatus === "Yes").length;

  const columns = useMemo(() => {
    const baseCols = [];

    // Only show Project column if "All Projects" is selected
    if (!selectedProjectId) {
      baseCols.push({
        key: "projectName",
        label: "Project",
        render: (row) => (
          <div className="flex flex-col">
              <span className="font-bold text-slate-900 font-outfit tracking-tight">{row.projectName}</span>
              <span className="text-[10px] font-medium text-slate-400 mt-0.5">ID: {row.id.slice(-6).toUpperCase()}</span>
          </div>
        )
      });
    }

    baseCols.push({ 
        key: "userName", 
        label: "Member",
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-[10px]">
              {row.userName?.charAt(0)}
            </div>
            <span className="text-[13px] font-bold text-slate-600 capitalize font-outfit">{row.userName}</span>
          </div>
        )
    });

    // Dynamic Columns from Project Form Definition
    if (selectedProjectId && project?.formDefinition) {
      project.formDefinition.forEach(field => {
        baseCols.push({
          key: field.fieldId,
          label: field.label,
          render: (row) => {
            const ans = row.answers?.find(a => a.fieldId === field.fieldId || a.label === field.label);
            return <span className="text-[13px] font-medium text-slate-900 line-clamp-1 max-w-[150px]">{ans?.value || "-"}</span>
          }
        });
      });
    }

    baseCols.push({
      key: "displayDate",
      label: "Date",
      render: (row) => <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{row.displayDate}</span>
    });

    baseCols.push({
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button 
          onClick={() => setSelectedReport(row)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-brand-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest border border-slate-100"
        >
          <Eye size={12} /> Details
        </button>
      )
    });

    return baseCols;
  }, [selectedProjectId, project, setSelectedReport]);

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center p-24 gap-4 animate-pulse">
            <div className="h-12 w-12 border-4 border-slate-100 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit">Loading reports...</p>
        </div>
    );
  }

  return (
    <section className="space-y-8 pb-12 relative">
      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-[48px] shadow-2xl border border-white flex flex-col animate-slideDown">
            <header className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-950 font-outfit leading-none">{selectedReport.projectName}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Detailed Intelligence Report</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-8 soft-scroll custom-scrollbar space-y-10">
               {/* Identity Card */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-3">
                     <div className="flex items-center gap-2 text-slate-400">
                        <User size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Surveyor</span>
                     </div>
                     <p className="text-sm font-bold text-slate-900 font-outfit capitalize">{selectedReport.userName}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-3">
                     <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Captured On</span>
                     </div>
                     <p className="text-sm font-bold text-slate-900 font-outfit">{selectedReport.displayDate}</p>
                  </div>
                  <div className="col-span-2 p-6 rounded-3xl bg-brand-500 text-white space-y-3 shadow-lg shadow-brand-500/10">
                     <div className="flex items-center gap-2 text-brand-100">
                        <MapPin size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Geo-Coordinates</span>
                     </div>
                     <p className="text-sm font-bold font-outfit">
                        {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                        <span className="ml-3 px-2 py-0.5 rounded-lg bg-white/20 text-[9px]">Verified GPS Link</span>
                     </p>
                  </div>
               </div>

               {/* Answers Section */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit">Survey Response Data</p>
                    <div className="h-px flex-1 bg-slate-50" />
                  </div>
                  
                  <div className="space-y-4">
                    {selectedReport.answers?.map((ans, i) => (
                      <div key={i} className="p-6 rounded-[28px] bg-white border border-slate-100 shadow-sm space-y-1.5 hover:border-brand-100 transition-colors group">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-brand-500 transition-colors">{ans.label}</p>
                        <p className="text-sm font-bold text-slate-900 font-outfit">{ans.value || <span className="text-slate-300 italic">No response</span>}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            <footer className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end">
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="h-14 px-10 rounded-2xl bg-slate-900 text-white text-xs font-bold uppercase tracking-widest font-outfit hover:bg-slate-800 transition-all shadow-xl"
                >
                  Confirm & Close
                </button>
            </footer>
          </div>
        </div>
      )}

      {/* Friendly Header with Gradient */}
      <div className="glass-panel overflow-hidden border-slate-100 bg-white/70 shadow-xl group">
        <div className="relative p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 rounded-full bg-brand-500 shadow-lg shadow-brand-500/30" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit">Data Reports</p>
            </div>
            <h2 className="text-4xl font-bold text-slate-900 font-outfit tracking-tight leading-tight">
              {selectedProjectId && project ? `${project.name} ` : "View & Export "}
              <span className="text-brand-600">Reports</span>.
            </h2>
            <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-xl">
              {selectedProjectId ? `Detailed analytical breakdown of all submissions for ${project?.name}.` : "Review all submissions from the field and export them easily into Excel or PDF formats."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
             <button className="h-14 px-8 rounded-2xl border-2 border-brand-100 text-brand-600 hover:bg-brand-50 transition-all text-xs font-bold uppercase tracking-widest font-outfit flex items-center gap-3 group" onClick={() => exportReportsToExcel(rows)}>
                <FileSpreadsheet size={18} /> Export Excel
             </button>
             <button className="h-14 px-8 rounded-2xl bg-brand-500 text-white hover:bg-brand-600 transition-all text-xs font-bold uppercase tracking-widest font-outfit flex items-center gap-3 group shadow-xl shadow-brand-500/10" onClick={() => exportReportsToPdf(rows)}>
                <Download size={18} /> Download PDF
             </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Total Reports" value={rows.length} icon={FileText} color="brand" helper="All submissions" />
        <StatCard title="With Photos" value={withPhotos} icon={Camera} color="accent" helper="Images attached" />
        <StatCard title="With Voice" value={withVoice} icon={Mic} color="success" helper="Audio recorded" />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between px-2">
            <div className="flex items-center gap-3">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit whitespace-nowrap">Report Feed</p>
                 <div className="h-px flex-1 bg-slate-50" />
            </div>

            <div className="relative flex-1 max-w-sm group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search by member or project..."
                    className="h-11 w-full pl-11 pr-4 rounded-xl border border-slate-100 bg-slate-50/50 outline-none focus:border-brand-500 focus:bg-white transition-all text-xs font-medium shadow-sm"
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        <div className="animate-fadeIn overflow-hidden">
          <DataTable columns={columns} rows={rows} />
        </div>
      </div>
    </section>
  );
};

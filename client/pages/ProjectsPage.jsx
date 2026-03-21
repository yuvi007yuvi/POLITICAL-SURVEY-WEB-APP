import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Search, 
  Sparkles, 
  Trash2, 
  Settings, 
  X,
  Rocket,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../components/DataTable.jsx";
import { projectService } from "../services/projectService.js";

export const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    status: "draft",
    formDefinition: [],
    assignedUsers: []
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.list
  });

  const createProject = useMutation({
    mutationFn: projectService.create,
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetForm();
      setShowCreate(false);
      if (newProject?._id) {
        navigate(`/projects/${newProject._id}/admin`);
      }
    }
  });

  const deleteProject = useMutation({
    mutationFn: projectService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      description: "",
      status: "draft",
      formDefinition: [],
      assignedUsers: []
    });
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      label: "Project Name",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-950 font-bold text-xs font-outfit">
            {row.code?.slice(0, 2) || "P"}
          </div>
          <div>
            <p className="font-bold text-slate-900 font-outfit tracking-tight">{row.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">
               ID: {row.code || "None"}
            </p>
          </div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${row.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${row.status === "active" ? "text-emerald-600" : "text-amber-600"}`}>
            {row.status || "Draft"}
          </span>
        </div>
      )
    },
    {
      key: "progress",
      label: "Progress",
      render: (row) => (
         <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-brand-500 rounded-full" style={{ width: '40%' }} />
            </div>
            <span className="text-[10px] font-bold text-slate-400">40%</span>
         </div>
      )
    },
    {
      key: "actions",
      label: "Manage",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/projects/${row._id}/admin`)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Settings size={12} />
            Setup
          </button>
          <button
            onClick={() => confirm("Are you sure you want to delete this project?") && deleteProject.mutate(row._id)}
            className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <section className="space-y-8 pb-12">
      {/* Header & Search */}
      <div className="glass-panel p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-white/70 border-slate-100 shadow-xl">
        <div className="space-y-1">
           <h2 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Projects</h2>
           <p className="text-xs font-medium text-slate-400">View and manage all your active surveys.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-xl justify-end">
           <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-300 group-focus-within:text-brand-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full pl-12 pr-4 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-medium"
              />
           </div>

           <button
            className="button-primary h-12 px-6 rounded-2xl shadow-xl shadow-brand-500/10 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
            onClick={() => setShowCreate(true)}
           >
            <Plus size={18} />
            New Project
           </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 ml-4">
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Map</p>
           <div className="h-px flex-1 bg-slate-50" />
        </div>
        <DataTable columns={columns} rows={filteredProjects} />
      </div>

      {/* Basic Creation Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-md" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md animate-slideUp">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden p-8 px-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} className="text-brand-500" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Start Project</p>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">New Survey</h3>
                </div>
                <button
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:text-slate-900 transition-all"
                  onClick={() => setShowCreate(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 ml-1">Project Name</label>
                  <input
                    className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-950 outline-none focus:border-brand-500 focus:bg-white transition-all"
                    placeholder="e.g. Village Survey"
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 ml-1">System Code</label>
                  <input
                    className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-950 outline-none focus:border-brand-500 focus:bg-white transition-all uppercase"
                    placeholder="VILL-01"
                    value={form.code}
                    onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 ml-1">Description</label>
                  <textarea
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-medium text-slate-700 outline-none focus:border-brand-500 focus:bg-white transition-all"
                    rows={3}
                    placeholder="Briefly describe this survey..."
                    value={form.description}
                    onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  />
                </div>

                <button
                  className="button-primary w-full h-14 rounded-2xl text-[xs] font-bold uppercase tracking-widest shadow-xl shadow-brand-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                  onClick={() => createProject.mutate(form)}
                  disabled={createProject.isPending}
                >
                  {createProject.isPending ? "Creating..." : (
                    <>
                       Create & Go
                       <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

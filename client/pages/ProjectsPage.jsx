import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers3, Plus, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../components/DataTable.jsx";
import { projectService } from "../services/projectService.js";
import { userService } from "../services/userService.js";

const METRIC_TEMPLATES = [
  { label: "Short Text", type: "text" },
  { label: "Paragraph", type: "textarea" },
  { label: "Dropdown", type: "select", options: [{ label: "Opt 1", value: "1" }] },
  { label: "Single Choice", type: "radio", options: [{ label: "Yes", value: "yes" }, { label: "No", value: "no" }] },
  { label: "Number", type: "number" },
  { label: "Date", type: "date" },
];

export const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    status: "draft",
    formDefinition: [],
    assignedUsers: []
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["users", 1],
    queryFn: () => userService.list(1)
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
      if (newProject?._id) {
        navigate(`/projects/${newProject._id}/admin`);
      }
    },
    onError: (error) => {
      const serverMessage = error.response?.data?.message;
      const clientMessage = error.message;
      alert(`Initialization Failure: ${serverMessage || clientMessage || "No diagnostic data provided by system."}`);
    }
  });

  const updateProject = useMutation({
    mutationFn: (payload) => projectService.update(editingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetForm();
    },
    onError: (error) => {
      const serverMessage = error.response?.data?.message;
      const clientMessage = error.message;
      alert(`Sync Failure: ${serverMessage || clientMessage || "Configuration update rejected by server."}`);
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
    setEditingId(null);
    setStep(1);
  };

  const addMetric = (template) => {
    const newField = {
      fieldId: `metric_${form.formDefinition.length + 1}_${Math.random().toString(36).substr(2, 4)}`,
      label: template.label === "Short Text" ? "" : template.label,
      type: template.type,
      required: false,
      options: template.options || []
    };
    setForm(f => ({ ...f, formDefinition: [...f.formDefinition, newField] }));
  };

  const handleEdit = (project) => {
    navigate(`/projects/${project._id}/admin`);
  };

  const nextStep = () => {
    if (step === 1 && (!form.name || !form.code)) return alert("Please establish project identity first.");
    if (step < 3) setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const updateField = (index, key, value) => {
    setForm((current) => ({
      ...current,
      formDefinition: current.formDefinition.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, [key]: value } : field
      )
    }));
  };

  const columns = [
    {
      key: "name",
      label: "Project Identifier",
      render: (row) => (
        <div className="py-1">
          <p className="font-bold text-surface-800">{row.name}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-surface-300 truncate max-w-[200px]">{row.description || "No description set"}</p>
        </div>
      )
    },
    {
      key: "code",
      label: "System Code",
      render: (row) => (
        <span className="badge-brand font-bold tabular-nums">
          {row.code}
        </span>
      )
    },
    {
      key: "status",
      label: "Deployment",
      render: (row) => (
        <span className={`badge ${row.status === "active" ? "badge-success" :
          row.status === "draft" ? "badge-warning" : "badge-neutral"
          }`}>
          {row.status}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 rounded-none text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title="Edit Protocol"
          >
            <WandSparkles size={16} />
          </button>
          <button
            onClick={() => confirm("Irreversible action. Delete this protocol?") && deleteProject.mutate(row._id)}
            className="p-1.5 rounded-none text-surface-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Decommission"
          >
            <Plus size={16} className="rotate-45" />
          </button>
        </div>
      )
    }
  ];

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Top Controls/Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-surface-800 tracking-tight">Project Orchestration</h2>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400 mt-1">Campaign lifecycle management</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-surface-300 tracking-widest">Active nodes</p>
            <p className="text-lg font-bold text-surface-800">{projects.length}</p>
          </div>
          <div className="h-8 w-px bg-surface-100" />
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-surface-300 tracking-widest">Global metrics</p>
            <p className="text-lg font-bold text-brand-600">{projects.reduce((acc, p) => acc + p.formDefinition.length, 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="panel shadow-panel flex flex-col min-h-[600px] border-t-4 border-t-brand-600">
          {/* Wizard Header & Stepper */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-surface-800">Project Initializer</h3>
                <p className="mt-1 text-[11px] font-medium text-surface-400 uppercase tracking-wider">
                  Establish core protocol identity
                </p>
              </div>
              <div className="h-12 w-12 flex items-center justify-center rounded-none bg-brand-50 text-brand-600 shadow-inner">
                <WandSparkles size={24} />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Project name</label>
                    <input className="input h-11" placeholder="District Mapping Drive" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">System Code</label>
                    <input className="input h-11" placeholder="PROJ-2026" value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Operation Scope / Narrative</label>
                  <textarea className="input min-h-[140px] resize-none py-3" placeholder="Define the core objectives and deliverables..." value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Deployment Status</label>
                  <select className="input h-11 appearance-none" value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="draft">Draft Protocol (Confidential)</option>
                    <option value="active">Live Deployment (Field Force Access)</option>
                    <option value="completed">Operational Archival</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h4 className="text-sm font-bold text-surface-800 uppercase tracking-widest mb-1 text-center">Field Force Registry</h4>
                  <p className="text-[11px] font-medium text-surface-400 text-center">Delegate intelligence collection to verified personnel</p>
                </div>
                <div className="flex flex-wrap gap-2.5 rounded-[2rem] border border-dashed border-surface-200 p-8 bg-surface-50/20 justify-center">
                  {allUsers?.items?.map((user) => {
                    const isSelected = form.assignedUsers?.includes(user._id);
                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, assignedUsers: isSelected ? f.assignedUsers.filter(id => id !== user._id) : [...f.assignedUsers, user._id] }))}
                        className={`group flex items-center gap-3 rounded-none px-5 py-2.5 text-[12px] font-bold transition-all duration-300 border ${isSelected ? "bg-brand-600 text-white border-brand-600 shadow-xl shadow-brand-500/20" : "bg-white text-surface-600 border-surface-100 hover:border-brand-200 shadow-sm"}`}
                      >
                        <div className={`h-2 w-2 rounded-none ${isSelected ? 'bg-white animate-pulse' : 'bg-surface-200'}`} />
                        {user.name}
                      </button>
                    );
                  })}
                  {usersLoading && <div className="skeleton h-10 w-full rounded-none" />}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col gap-4 mb-2 text-center md:text-left">
                  <div>
                    <h4 className="text-sm font-bold text-surface-800 uppercase tracking-widest">Rapid Metric Deployment</h4>
                    <p className="text-[11px] font-medium text-surface-400 mt-1">Select templates to instantly build your survey schema</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {METRIC_TEMPLATES.map(tmp => (
                      <button
                        key={tmp.label}
                        type="button"
                        onClick={() => addMetric(tmp)}
                        className="h-8 px-3 text-[9px] font-bold border border-surface-100 bg-white hover:border-brand-500 hover:text-brand-600 transition-all uppercase tracking-widest shadow-sm flex items-center gap-2"
                      >
                        <Plus size={12} /> {tmp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {form.formDefinition.map((field, index) => (
                    <div key={field.fieldId} className="flex flex-col md:flex-row gap-4 p-5 rounded-none border border-surface-100 bg-white hover:border-brand-200 transition-colors relative group">
                      <div className="flex md:flex-col items-center justify-between md:justify-center border-r border-surface-50 pr-4 md:w-12">
                        <span className="text-lg font-black text-surface-200 group-hover:text-brand-500 transition-colors">{String(index + 1).padStart(2, '0')}</span>
                      </div>

                      <div className="grid flex-1 gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-surface-400">Label</label>
                          <input className="input h-9 text-xs" placeholder="e.g. Respondent Age" value={field.label} onChange={e => updateField(index, "label", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-surface-400">Class</label>
                          <select className="input h-9 text-xs appearance-none" value={field.type} onChange={e => updateField(index, "type", e.target.value)}>
                            {["text", "number", "select", "date", "checkbox", "radio", "textarea"].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-surface-400">Identifier</label>
                          <input className="input h-9 text-[10px] bg-surface-50/50 font-mono" value={field.fieldId} onChange={e => updateField(index, "fieldId", e.target.value)} />
                        </div>
                        <div className={`space-y-1 transition-opacity duration-300 ${["select", "radio", "checkbox"].includes(field.type) ? "opacity-100" : "opacity-30"}`}>
                          <label className="text-[9px] font-bold uppercase tracking-widest text-surface-400">Define Choices (Comma Separated)</label>
                          <input
                            className="input h-9 text-xs"
                            placeholder="e.g. Option 1, Option 2"
                            value={field.options?.map(o => o.label).join(", ") || ""}
                            onChange={e => updateField(index, "options", e.target.value.split(",").map(o => ({ label: o.trim(), value: o.trim() })))}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, formDefinition: f.formDefinition.filter((_, i) => i !== index) }))}
                        className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center bg-white border border-rose-100 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        <Plus size={12} className="rotate-45" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Wizard Navigation */}
          <div className="pt-8 border-t border-surface-100 mt-auto">
            <button
              type="button"
              className="button-primary w-full h-12 shadow-xl shadow-brand-600/30"
              onClick={() => createProject.mutate(form)}
              disabled={createProject.isPending}
            >
              {createProject.isPending ? "Synchronizing..." : "Initialize Campaign & Configure"}
            </button>
          </div>
        </div>

        {/* Existing Inventory */}
        <div className="space-y-6">
          <div className="panel shadow-panel bg-brand-50 border-brand-100 relative overflow-hidden p-6 group">
            <div className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20 [background:radial-gradient(circle_at_bottom_right,var(--brand-500),transparent_70%)]" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-brand-700 tracking-tight">Intelligence Inventory</h3>
              <p className="mt-1 text-xs font-medium text-brand-600/70 uppercase tracking-widest">Active Survey Protocols</p>
            </div>
          </div>
          <DataTable columns={columns} rows={projects} />
        </div>
      </div>
    </section>
  );
};


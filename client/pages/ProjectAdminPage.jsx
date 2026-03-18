import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Layers3, Plus, Settings2, Users as UsersIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

export const ProjectAdminPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("schema");
    const [form, setForm] = useState(null);

    const { data: project, isLoading: projectLoading } = useQuery({
        queryKey: ["project", id],
        queryFn: () => projectService.list().then(list => list.find(p => p._id === id)),
        enabled: !!id
    });

    const { data: allUsers } = useQuery({
        queryKey: ["users", 1],
        queryFn: () => userService.list(1)
    });

    useEffect(() => {
        if (project) {
            setForm({
                name: project.name,
                code: project.code,
                description: project.description || "",
                status: project.status,
                formDefinition: project.formDefinition || [],
                assignedUsers: project.assignedUsers?.map(u => u._id || u) || []
            });
        }
    }, [project]);

    const updateMutation = useMutation({
        mutationFn: (payload) => projectService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["project", id] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            alert("Project Protocol Synchronized Successfully.");
        }
    });

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

    const updateField = (index, key, value) => {
        setForm((current) => ({
            ...current,
            formDefinition: current.formDefinition.map((field, fieldIndex) =>
                fieldIndex === index ? { ...field, [key]: value } : field
            )
        }));
    };

    if (projectLoading || !form) return <div className="p-8 text-center text-surface-400 font-bold uppercase tracking-widest animate-pulse">Synchronizing Data...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/projects")}
                        className="h-10 w-10 flex items-center justify-center rounded-none bg-surface-50 text-surface-400 hover:text-brand-600 border border-surface-100 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-extrabold text-surface-800 tracking-tight">{project.name}</h2>
                            <span className="badge-brand text-[9px] uppercase tracking-widest px-2 py-0.5">Control Center</span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 mt-1">Operational ID: {project.code}</p>
                    </div>
                </div>
                <button
                    onClick={() => updateMutation.mutate(form)}
                    disabled={updateMutation.isPending}
                    className="button-primary h-11 px-8 shadow-xl shadow-brand-600/20"
                >
                    {updateMutation.isPending ? "Syncing..." : "Sync Protocol"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-surface-100">
                {[
                    { id: "schema", label: "Intelligence Schema", icon: Layers3 },
                    { id: "resources", label: "Resource Allocation", icon: UsersIcon },
                    { id: "settings", label: "General Protocol", icon: Settings2 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id ? "text-brand-600" : "text-surface-400 hover:text-surface-600"
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-600" />}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="py-4">
                {activeTab === "schema" && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="flex flex-col gap-4 mb-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="h-1 w-6 bg-brand-500" /> Rapid Metric Deployment
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {METRIC_TEMPLATES.map(tmp => (
                                    <button
                                        key={tmp.label}
                                        onClick={() => addMetric(tmp)}
                                        className="h-9 px-4 text-[10px] font-bold border border-surface-100 bg-white hover:border-brand-500 hover:text-brand-600 transition-all uppercase tracking-widest shadow-sm flex items-center gap-2"
                                    >
                                        <Plus size={12} /> {tmp.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {form.formDefinition.map((field, index) => (
                                <div key={field.fieldId} className="flex flex-col md:flex-row gap-4 panel bg-white border-surface-100 hover:border-brand-200 transition-colors p-5 relative group">
                                    <div className="flex md:flex-col items-center justify-between md:justify-center border-r border-surface-50 pr-4 md:w-16">
                                        <span className="text-[9px] font-black text-brand-600/40 uppercase tracking-tighter">NODE</span>
                                        <span className="text-lg font-black text-surface-300 group-hover:text-brand-500 transition-colors">{String(index + 1).padStart(2, '0')}</span>
                                    </div>

                                    <div className="grid flex-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-surface-400">Label</label>
                                            <input className="input h-9 text-xs" placeholder="e.g. Respondent Age" value={field.label} onChange={e => updateField(index, "label", e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-surface-400">Class</label>
                                            <select className="input h-9 text-xs appearance-none" value={field.type} onChange={e => updateField(index, "type", e.target.value)}>
                                                {["text", "number", "select", "date", "checkbox", "radio", "textarea"].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5 lg:col-span-1">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-surface-400">Identifier</label>
                                            <input className="input h-9 text-[10px] bg-surface-50/50 font-mono" placeholder="Internal ID" value={field.fieldId} onChange={e => updateField(index, "fieldId", e.target.value)} />
                                        </div>
                                        <div className={`space-y-1.5 transition-opacity duration-300 ${["select", "radio", "checkbox"].includes(field.type) ? "opacity-100" : "opacity-30"}`}>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-surface-400">Define Choices (Comma Separated)</label>
                                            <input
                                                className="input h-9 text-xs"
                                                placeholder="e.g. Yes, No, Other"
                                                value={field.options?.map(o => o.label).join(", ") || ""}
                                                onChange={e => updateField(index, "options", e.target.value.split(",").map(o => ({ label: o.trim(), value: o.trim() })))}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setForm(f => ({ ...f, formDefinition: f.formDefinition.filter((_, i) => i !== index) }))}
                                        className="absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center bg-white border border-rose-100 text-rose-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    >
                                        <Plus size={14} className="rotate-45" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "resources" && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-center mb-8">
                            <h4 className="text-sm font-bold text-surface-800 uppercase tracking-widest mb-1">Field Force Registry</h4>
                            <p className="text-[11px] font-medium text-surface-400">Delegate intelligence collection to verified personnel</p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {allUsers?.items?.map((user) => {
                                const isSelected = form.assignedUsers.includes(user._id);
                                return (
                                    <button
                                        key={user._id}
                                        onClick={() => setForm(f => ({ ...f, assignedUsers: isSelected ? f.assignedUsers.filter(id => id !== user._id) : [...f.assignedUsers, user._id] }))}
                                        className={`flex items-center gap-3 px-6 py-3 border transition-all duration-300 text-[12px] font-bold ${isSelected ? "bg-brand-600 text-white border-brand-600 shadow-xl shadow-brand-500/20" : "bg-white text-surface-600 border-surface-100 hover:border-brand-200"
                                            }`}
                                    >
                                        <div className={`h-2 w-2 ${isSelected ? 'bg-white animate-pulse' : 'bg-surface-200'}`} />
                                        {user.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Project Identity</label>
                                <input className="input h-12" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">System Code</label>
                                <input className="input h-12" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Deployment Narrative</label>
                                <textarea className="input min-h-[140px] py-4" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Operational Status</label>
                                <select className="input h-12 appearance-none" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                    <option value="draft">Draft Protocol (Confidential)</option>
                                    <option value="active">Live Deployment (Field Access)</option>
                                    <option value="completed">Operational Archival</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Layers3, Plus, Settings2, Users as UsersIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../services/projectService.js";
import { userService } from "../services/userService.js";

const emptyField = { fieldId: "", label: "", type: "text", required: false, options: [] };

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
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">Configure Data Acquisition Nodes</p>
                            <button
                                className="button-secondary h-9 px-4 text-[10px] font-bold uppercase tracking-widest"
                                onClick={() => setForm(f => ({ ...f, formDefinition: [...f.formDefinition, { ...emptyField, fieldId: `field_${Date.now()}` }] }))}
                            >
                                <Plus size={14} className="mr-1.5" /> Append Metric
                            </button>
                        </div>
                        <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {form.formDefinition.map((field, index) => (
                                <div key={field.fieldId} className="panel bg-surface-50/30 border-surface-100 hover:border-brand-200 transition-colors p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 flex items-center justify-center bg-brand-50 text-brand-600 border border-brand-100">
                                                <span className="text-xs font-bold">{index + 1}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Metric Config</span>
                                        </div>
                                        <button
                                            onClick={() => setForm(f => ({ ...f, formDefinition: f.formDefinition.filter((_, i) => i !== index) }))}
                                            className="text-[10px] font-bold text-rose-400 hover:text-rose-600 uppercase tracking-widest"
                                        >
                                            Decommission
                                        </button>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <input className="input h-10 text-xs" placeholder="Field ID" value={field.fieldId} onChange={e => updateField(index, "fieldId", e.target.value)} />
                                        <input className="input h-10 text-xs" placeholder="Label" value={field.label} onChange={e => updateField(index, "label", e.target.value)} />
                                        <select className="input h-10 text-xs appearance-none" value={field.type} onChange={e => updateField(index, "type", e.target.value)}>
                                            {["text", "number", "select", "date", "checkbox", "radio", "textarea"].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                                        </select>
                                        <input className="input h-10 text-xs" placeholder="Options (CSV)" value={field.options?.map(o => o.label).join(", ") || ""} onChange={e => updateField(index, "options", e.target.value.split(",").map(o => ({ label: o.trim(), value: o.trim() })))} />
                                    </div>
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

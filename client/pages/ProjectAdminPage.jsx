import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Info, 
  Layers3, 
  Plus, 
  Save, 
  Settings2, 
  Trash2, 
  Users as UsersIcon, 
  X,
  CheckCircle2
} from "lucide-react";
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
        }
    });

    const addMetric = (template) => {
        const newField = {
            fieldId: `field_${form.formDefinition.length + 1}_${Math.random().toString(36).substr(2, 4)}`,
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

    if (projectLoading || !form) return (
        <div className="flex flex-col items-center justify-center p-32 gap-6 animate-pulse">
            <div className="h-16 w-16 border-4 border-slate-100 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-[11px] font-bold text-slate-400 font-outfit uppercase tracking-widest">Loading Project Details...</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-16">
            {/* Simple Management Header */}
            <header className="glass-panel p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-white/70 border-slate-100 shadow-xl">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate("/projects")}
                        className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-slate-900 transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight leading-none">{project.name}</h2>
                        <p className="text-xs font-medium text-slate-400 mt-2">Manage settings and form questions.</p>
                    </div>
                </div>
                
                <button
                    onClick={() => updateMutation.mutate(form)}
                    disabled={updateMutation.isPending}
                    className="button-primary h-12 px-8 rounded-2xl shadow-xl shadow-brand-500/10 text-xs font-bold uppercase tracking-widest flex items-center gap-3"
                >
                    {updateMutation.isPending ? "Saving..." : (
                       <>
                          <Save size={16} />
                          Save Changes
                       </>
                    )}
                </button>
            </header>

            {/* Simple Subnav */}
            <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl w-fit">
                {[
                    { id: "schema", label: "Form Questions", icon: Layers3 },
                    { id: "resources", label: "Team Access", icon: UsersIcon },
                    { id: "settings", label: "Project Info", icon: Settings2 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                            activeTab === tab.id 
                                ? "bg-brand-500 text-white shadow-lg" 
                                : "text-slate-400 hover:text-slate-900"
                        }`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="animate-fadeIn">
                {activeTab === "schema" && (
                    <div className="grid gap-10 xl:grid-cols-[1fr_340px]">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 ml-2 mb-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Form Fields</p>
                                <div className="h-px flex-1 bg-slate-50" />
                            </div>

                            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                {form.formDefinition.map((field, index) => (
                                    <div key={field.fieldId} className="group relative rounded-3xl border border-slate-100 bg-white p-6 transition-all hover:border-brand-200 hover:shadow-lg">
                                        <div className="flex flex-col lg:flex-row gap-6">
                                            <div className="lg:w-12 flex lg:flex-col items-center justify-center text-slate-200 group-hover:text-slate-400 transition-colors">
                                                 <span className="text-xl font-bold font-outfit">{index + 1}</span>
                                            </div>

                                            <div className="grid flex-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-end">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 ml-1">Question Title</label>
                                                    <input 
                                                       className="w-full h-11 px-4 rounded-xl border border-slate-100 bg-slate-50/30 text-xs font-bold text-slate-900 focus:border-brand-500 focus:bg-white outline-none transition-all" 
                                                       value={field.label} 
                                                       onChange={e => updateField(index, "label", e.target.value)} 
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 ml-1">Field Type</label>
                                                    <select 
                                                       className="w-full h-11 px-4 rounded-xl border border-slate-100 bg-slate-50/30 text-[10px] font-bold uppercase text-slate-950 focus:border-brand-500 outline-none transition-all cursor-pointer" 
                                                       value={field.type} 
                                                       onChange={e => updateField(index, "type", e.target.value)}
                                                    >
                                                        {["text", "number", "select", "date", "checkbox", "radio", "textarea"].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                                                    </select>
                                                </div>
                                                <div className={`space-y-2 ${["select", "radio", "checkbox"].includes(field.type) ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                                                    <label className="text-[10px] font-bold text-slate-400 ml-1">Options (Comma separated)</label>
                                                    <input
                                                        className="w-full h-11 px-4 rounded-xl border border-slate-100 bg-slate-50/30 text-xs font-medium text-slate-900 focus:border-brand-500 outline-none transition-all"
                                                        placeholder="Yes, No"
                                                        value={field.options?.map(o => o.label).join(", ") || ""}
                                                        onChange={e => updateField(index, "options", e.target.value.split(",").map(o => ({ label: o.trim(), value: o.trim() })))}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setForm(f => ({ ...f, formDefinition: f.formDefinition.filter((_, i) => i !== index) }))}
                                            className="absolute -top-2 -right-2 h-8 w-8 flex items-center justify-center bg-white border border-slate-100 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <aside className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm sticky top-8">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Add Question</p>
                                <div className="grid gap-3">
                                    {METRIC_TEMPLATES.map(tmp => (
                                        <button
                                            key={tmp.label}
                                            onClick={() => addMetric(tmp)}
                                            className="h-12 w-full flex items-center justify-between px-5 rounded-2xl bg-slate-50/50 border border-slate-50 hover:border-brand-500 hover:bg-brand-50 group transition-all"
                                        >
                                            <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{tmp.label}</span>
                                            <Plus size={16} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-50">
                                    <div className="flex gap-3 text-slate-400">
                                        <Info size={16} className="shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-medium leading-relaxed">Changes saved will be instantly visible to field members.</p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                )}

                {activeTab === "resources" && (
                    <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn py-10">
                        <header className="text-center space-y-2">
                             <div className="inline-flex h-16 w-16 items-center justify-center rounded-[28px] bg-brand-500 shadow-xl text-white mb-4">
                                <UsersIcon size={24} />
                             </div>
                            <h4 className="text-4xl font-bold text-slate-900 font-outfit tracking-tight">Team Members</h4>
                            <p className="text-sm font-medium text-slate-400">Select who can access and submit reports for this project.</p>
                        </header>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-6">
                            {allUsers?.items?.map((user) => {
                                const isSelected = form.assignedUsers.includes(user._id);
                                return (
                                    <button
                                        key={user._id}
                                        onClick={() => setForm(f => ({ ...f, assignedUsers: isSelected ? f.assignedUsers.filter(id => id !== user._id) : [...f.assignedUsers, user._id] }))}
                                        className={`group relative flex items-center justify-between p-5 rounded-[28px] border-2 transition-all duration-300 ${
                                            isSelected 
                                                ? "bg-brand-500 border-brand-500 text-white shadow-xl shadow-brand-500/20 scale-105" 
                                                : "bg-white border-slate-50 text-slate-600 hover:border-brand-200"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 flex items-center justify-center rounded-xl font-bold text-xs ${isSelected ? "bg-white/10" : "bg-slate-50 text-slate-400"}`}>
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="text-left">
                                               <p className="text-sm font-bold font-outfit leading-none">{user.name}</p>
                                               <p className={`text-[10px] font-medium mt-1.5 ${isSelected ? "text-brand-400" : "text-slate-400"}`}>Field Member</p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle2 size={16} className="text-brand-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="max-w-xl mx-auto space-y-10 animate-fadeIn py-10">
                        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-2">Project Name</label>
                                    <input 
                                       className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50/30 text-base font-bold text-slate-950 focus:border-brand-500 focus:bg-white outline-none transition-all" 
                                       value={form.name} 
                                       onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-2">Project Code</label>
                                    <input 
                                       className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-slate-50/30 text-sm font-bold tracking-widest text-slate-400 font-mono uppercase outline-none" 
                                       value={form.code} 
                                       onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-2">Brief Description</label>
                                    <textarea 
                                       className="w-full min-h-[160px] p-6 rounded-[28px] border border-slate-100 bg-slate-50/30 text-sm font-medium text-slate-700 focus:border-brand-500 focus:bg-white outline-none transition-all resize-none" 
                                       value={form.description} 
                                       onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 ml-2">Current Status</label>
                                    <select 
                                       className="w-full h-14 px-6 rounded-2xl border border-slate-100 bg-white text-[10px] font-bold uppercase tracking-widest text-slate-900 focus:border-brand-500 outline-none transition-all cursor-pointer shadow-sm appearance-none" 
                                       value={form.status} 
                                       onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                    >
                                        <option value="draft">Draft (Private)</option>
                                        <option value="active">Active (Field Ready)</option>
                                        <option value="completed">Completed (Closed)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

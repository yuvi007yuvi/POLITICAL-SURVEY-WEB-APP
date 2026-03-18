import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Plus, ShieldAlert, ShieldCheck, Trash2, X } from "lucide-react";
import { useState } from "react";
import { DataTable } from "../components/DataTable.jsx";
import { roleService } from "../services/roleService.js";

const PERMISSIONS = [
    { key: "view_dashboard", label: "View Dashboard" },
    { key: "manage_projects", label: "Manage Projects" },
    { key: "view_all_reports", label: "View All Reports" },
    { key: "view_assigned_reports", label: "View Assigned Reports" },
    { key: "manage_users", label: "Manage Users" },
    { key: "manage_roles", label: "Manage Roles" },
    { key: "submit_surveys", label: "Submit Surveys" }
];

const emptyForm = { name: "", description: "", permissions: [] };

export const RolesPage = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const { data: roles = [], isLoading } = useQuery({
        queryKey: ["roles"],
        queryFn: roleService.list
    });

    const createMutation = useMutation({
        mutationFn: roleService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            setForm(emptyForm);
            setShowForm(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...payload }) => roleService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            setEditingRole(null);
            setForm(emptyForm);
            setShowForm(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: roleService.remove,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] })
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingRole) {
            updateMutation.mutate({ id: editingRole._id, ...form });
        } else {
            createMutation.mutate(form);
        }
    };

    const togglePermission = (perm) => {
        setForm(prev => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter(p => p !== perm)
                : [...prev.permissions, perm]
        }));
    };

    const columns = [
        {
            key: "name",
            label: "Administrative Role",
            render: (row) => (
                <div className="flex items-center gap-4 py-1">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-none border shadow-sm ${row.isSystemRole ? "bg-brand-50 text-brand-600 border-brand-100" : "bg-surface-50 text-surface-400 border-surface-100"}`}>
                        {row.isSystemRole ? <ShieldCheck size={18} /> : <Shield size={18} />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-surface-900">{row.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-surface-300">Identifier: {row.key}</p>
                    </div>
                </div>
            )
        },
        {
            key: "permissions",
            label: "Capability Set",
            render: (row) => (
                <div className="flex flex-wrap gap-1.5 max-w-sm">
                    {row.permissions.map(p => (
                        <span key={p} className="badge-neutral border border-surface-200/50 bg-surface-50/50 px-2 py-0.5 text-[9px] font-bold shadow-sm capitalize">
                            {p.replace(/_/g, " ")}
                        </span>
                    ))}
                    {row.permissions.length === 0 && <span className="text-[10px] font-bold italic text-surface-200 uppercase tracking-tight">Access restricted</span>}
                </div>
            )
        },
        {
            key: "type",
            label: "Registry Type",
            render: (row) => (
                <span className={`text-[10px] font-bold uppercase tracking-widest ${row.isSystemRole ? "text-brand-600" : "text-surface-300"}`}>
                    {row.isSystemRole ? "Immutable" : "Mutable"}
                </span>
            )
        },
        {
            key: "actions",
            label: "",
            render: (row) => (
                !row.isSystemRole && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
                        <button
                            onClick={() => { setEditingRole(row); setForm({ name: row.name, description: row.description, permissions: row.permissions }); setShowForm(true); }}
                            className="rounded-none p-2 text-surface-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                        >
                            <UserPen size={15} />
                        </button>
                        <button
                            onClick={() => { if (confirm("Delete this role registry?")) deleteMutation.mutate(row._id); }}
                            className="rounded-none p-2 text-surface-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                )
            )
        }
    ];

    if (isLoading) return (
        <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
            <div className="panel animate-pulse min-h-[500px]">
                <div className="h-12 w-12 rounded-none bg-surface-100 mx-auto" />
            </div>
            <div className="panel bg-surface-50/50" />
        </div>
    );

    return (
        <section className="space-y-6 animate-fadeIn">
            {/* Access Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-surface-900 tracking-tight">Access Control Protocols</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 mt-1">Role-Based Permission Matrix</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-none bg-brand-50 text-brand-600 shadow-inner">
                    <ShieldAlert size={24} />
                </div>
            </div>
            <button
                className={`${showForm ? 'button-secondary' : 'button-primary'} h-10 px-6 transition-all duration-300`}
                onClick={() => { setEditingRole(null); setForm(emptyForm); setShowForm(!showForm); }}
            >
                {showForm ? <X size={16} /> : <Plus size={16} />}
                <span className="ml-2">{showForm ? "Cancel" : "Define Protocol"}</span>
            </button>

            {/* Create/Edit Form */}
            {showForm && (
                <form className="panel shadow-card animate-fadeIn space-y-6 border-t-4 border-t-brand-500" onSubmit={handleSubmit}>
                    <div>
                        <h4 className="text-base font-bold text-surface-900">
                            {editingRole ? `Updating Protocol: ${editingRole.name}` : "Establish New Access Protocol"}
                        </h4>
                        <p className="text-[11px] font-medium text-surface-400 uppercase tracking-wider mt-1">Configure capability matrix</p>
                    </div>

                    <div className="h-px bg-surface-100" />

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Protocol Name</label>
                            <input className="input" placeholder="e.g. Intelligence Analyst" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Objective / Scope</label>
                            <input className="input" placeholder="Describe access limitations..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Permission Matrix</label>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {PERMISSIONS.map(p => {
                                const isSelected = form.permissions.includes(p.key);
                                return (
                                    <div
                                        key={p.key}
                                        onClick={() => togglePermission(p.key)}
                                        className={`group flex cursor-pointer items-center justify-between rounded-none border p-4 transition-all duration-200 ${isSelected
                                            ? "bg-brand-50/50 border-brand-200 shadow-sm"
                                            : "bg-surface-50/30 border-surface-100 hover:border-brand-200"}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-5 w-5 items-center justify-center rounded-none border transition-colors ${isSelected ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-surface-200 group-hover:border-brand-300"}`}>
                                                {isSelected && <Check size={12} strokeWidth={4} />}
                                            </div>
                                            <span className={`text-[12px] font-bold transition-colors ${isSelected ? "text-brand-900" : "text-surface-600"}`}>{p.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button className="button-primary w-full h-12 shadow-lg shadow-brand-500/20" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {(createMutation.isPending || updateMutation.isPending) ? "Syncing..." : editingRole ? "Update Identity" : "Commit Protocol"}
                    </button>
                </form>
            )}

            <DataTable columns={columns} rows={roles} />
        </section>
    );
};

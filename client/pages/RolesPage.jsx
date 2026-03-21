import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Download, Plus, Shield, ShieldCheck, Trash2, UserPen, X, CheckCircle2 } from "lucide-react";
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
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...payload }) => roleService.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: roleService.remove,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] })
    });

    const resetForm = () => {
        setEditingRole(null);
        setForm(emptyForm);
        setShowForm(false);
    };

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
            label: "Role Name",
            render: (row) => (
                <div className="flex items-center gap-4 py-1">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
                        row.isSystemRole 
                            ? "bg-brand-500 border-brand-500 text-white shadow-md" 
                            : "bg-slate-50 border-slate-100 text-slate-300"
                    }`}>
                        {row.isSystemRole ? <ShieldCheck size={18} /> : <Shield size={18} />}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 font-outfit tracking-tight">{row.name}</p>
                        <p className="text-[10px] font-medium text-slate-400">Key: {row.key}</p>
                    </div>
                </div>
            )
        },
        {
            key: "permissions",
            label: "Access",
            render: (row) => (
                <div className="flex flex-wrap gap-1.5 max-w-md">
                    {row.permissions.map(p => (
                        <span key={p} className="inline-flex px-2.5 py-1 rounded-full bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">
                            {p.replace(/_/g, " ")}
                        </span>
                    ))}
                    {row.permissions.length === 0 && (
                        <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">No Access</span>
                    )}
                </div>
            )
        },
        {
            key: "status",
            label: "Type",
            render: (row) => (
                <span className={`text-[10px] font-bold uppercase tracking-widest ${row.isSystemRole ? "text-brand-600" : "text-slate-400"}`}>
                    {row.isSystemRole ? "System" : "Custom"}
                </span>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setEditingRole(row); setForm({ name: row.name, description: row.description, permissions: row.permissions }); setShowForm(true); }}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
                    >
                        <UserPen size={14} />
                    </button>
                    {!row.isSystemRole && row.key !== "super_admin" && (
                        <button
                            onClick={() => { if (confirm("Delete this role?")) deleteMutation.mutate(row._id); }}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 gap-4 animate-pulse">
                <div className="h-12 w-12 border-4 border-slate-100 border-t-brand-500 rounded-full animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit">Loading roles...</p>
            </div>
        );
    }

    return (
        <section className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="glass-panel p-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-slate-100 bg-white shadow-xl">
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">User Roles</p>
                    <h3 className="text-xl font-bold text-slate-900 font-outfit tracking-tight">Manage Roles</h3>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="button-primary h-12 px-8 rounded-2xl shadow-xl shadow-brand-500/10 active:scale-95 transition-all text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Role
                    </button>
                </div>
            </div>

            <div className="animate-fadeIn">
                <DataTable columns={columns} rows={roles} />
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-md" onClick={() => setShowForm(false)} />
                    <div className="relative w-full max-w-4xl transform animate-slideUp">
                        <div className="bg-white overflow-hidden border border-slate-100 shadow-2xl rounded-[40px]">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 mb-1">Role Details</p>
                                    <h3 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">
                                        {editingRole ? "Edit Role" : "Create New Role"}
                                    </h3>
                                </div>
                                <button
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:text-slate-900 transition-all"
                                    onClick={() => setShowForm(false)}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 ml-1">Role Name</label>
                                        <input
                                            className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-950 outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm"
                                            placeholder="e.g. Supervisor"
                                            value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            required
                                            disabled={editingRole?.isSystemRole}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-400 ml-1">Description</label>
                                        <input
                                            className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-medium text-slate-950 outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm"
                                            placeholder="What can this role do?"
                                            value={form.description}
                                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 px-1">
                                      <div className="h-px flex-1 bg-slate-50" />
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Choose Access Levels</p>
                                      <div className="h-px flex-1 bg-slate-50" />
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {PERMISSIONS.map(p => {
                                            const active = form.permissions.includes(p.key);
                                            return (
                                                <button
                                                    key={p.key}
                                                    type="button"
                                                    onClick={() => togglePermission(p.key)}
                                                    className={`group relative flex flex-col items-start gap-4 p-6 rounded-3xl border-2 transition-all duration-300 ${
                                                        active ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/10 scale-[1.02]" : "bg-white border-slate-50 text-slate-600 hover:border-brand-200"
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-xl transition-colors ${active ? "bg-white/20" : "bg-slate-50 group-hover:bg-brand-50"}`}>
                                                      <Shield size={16} className={active ? "text-white" : "text-slate-400 group-hover:text-brand-500"} />
                                                    </div>
                                                    <div className="flex items-center justify-between w-full">
                                                      <span className="text-[11px] font-extrabold tracking-tight uppercase">{p.label}</span>
                                                      {active && <CheckCircle2 size={16} className="text-white fill-white/20" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    className="button-primary h-14 w-full rounded-2xl text-[xs] font-bold uppercase tracking-widest shadow-xl shadow-brand-500/10 active:scale-95 transition-all mt-4"
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save Role"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

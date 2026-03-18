import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, ShieldCheck, UserMinus, UserPen, X } from "lucide-react";
import { useState } from "react";
import { DataTable } from "../components/DataTable.jsx";
import { userService } from "../services/userService.js";
import { projectService } from "../services/projectService.js";
import { roleService } from "../services/roleService.js";

const roleColors = {
  super_admin: "bg-rose-50 text-rose-600 border-rose-100",
  admin: "bg-violet-50 text-violet-600 border-violet-100",
  regional_admin: "bg-blue-50 text-blue-600 border-blue-100",
  surveyor: "bg-brand-50 text-brand-600 border-brand-100"
};

const emptyForm = { name: "", email: "", password: "", role: "", phone: "", assignedProjects: [] };

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["users", 1],
    queryFn: () => userService.list(1)
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: roleService.list
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.list
  });

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setForm(emptyForm);
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }) => userService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      setForm(emptyForm);
      setShowForm(false);
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: userService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      const { password, email, ...payload } = form;
      updateMutation.mutate({ id: editingUser._id, ...payload });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role?._id || user.role,
      phone: user.phone || "",
      assignedProjects: user.assignedProjects?.map(p => p._id || p) || []
    });
    setShowForm(true);
  };

  const toggleProject = (projectId) => {
    setForm((prev) => ({
      ...prev,
      assignedProjects: prev.assignedProjects.includes(projectId)
        ? prev.assignedProjects.filter((id) => id !== projectId)
        : [...prev.assignedProjects, projectId]
    }));
  };

  const columns = [
    {
      key: "name",
      label: "Personnel",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-none border text-[12px] font-bold uppercase shadow-sm ${roleColors[row.role?.key] || "bg-surface-50 text-surface-500 border-surface-100"}`}>
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-surface-900">{row.name}</p>
            <p className="text-[11px] font-medium text-surface-400">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: "role",
      label: "Access Level",
      render: (row) => (
        <span className={`badge ${roleColors[row.role?.key]?.split(' ')[1].replace('text-', 'bg-').replace('600', '100')} ${roleColors[row.role?.key]?.split(' ')[1]}`}>
          {row.role?.name || "Member"}
        </span>
      )
    },
    {
      key: "status",
      label: "System Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-none ring-4 ring-opacity-10 ${row.isActive ? "bg-emerald-500 ring-emerald-500" : "bg-surface-300 ring-surface-300"}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${row.isActive ? "text-emerald-600" : "text-surface-400"}`}>
            {row.isActive ? "Verified" : "Standby"}
          </span>
        </div>
      )
    },
    {
      key: "assignedProjects",
      label: "Assigned Units",
      render: (row) => {
        const codes = row.assignedProjects?.map((p) => p.code).filter(Boolean);
        return codes?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {codes.map((code) => (
              <span key={code} className="badge-neutral border border-surface-200/50 bg-surface-50/50 px-2 py-0.5 text-[9px] font-bold shadow-sm">{code}</span>
            ))}
          </div>
        ) : (
          <span className="text-[10px] font-bold italic text-surface-200">No Assignments</span>
        );
      }
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        row.role?.key !== "super_admin" && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
            <button onClick={() => startEdit(row)} className="rounded-none p-2 text-surface-400 hover:bg-brand-50 hover:text-brand-600 transition-colors">
              <UserPen size={15} />
            </button>
            <button
              onClick={() => { if (confirm("Deactivate this user?")) deactivateMutation.mutate(row._id); }}
              className="rounded-none p-2 text-surface-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <UserMinus size={15} />
            </button>
          </div>
        )
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="panel shadow-panel animate-pulse space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-none bg-surface-100" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-surface-100 rounded-none" />
            <div className="h-3 w-32 bg-surface-50 rounded-none" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="panel shadow-panel flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-none bg-brand-50 text-brand-600 shadow-inner">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-surface-900">Force Registry</h3>
            <p className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">Platform Personnel Management</p>
          </div>
        </div>
        <button
          className={`${showForm ? 'button-secondary' : 'button-primary'} h-10 px-6 transition-all duration-300`}
          onClick={() => { setEditingUser(null); setForm(emptyForm); setShowForm(!showForm); }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span className="ml-2">{showForm ? "Cancel" : "Add Personnel"}</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form className="panel shadow-card animate-fadeIn space-y-6 border-t-4 border-t-brand-500" onSubmit={handleSubmit}>
          <div>
            <h4 className="text-base font-bold text-surface-900">
              {editingUser ? `Updating Identity: ${editingUser.name}` : "Registrar New Identity"}
            </h4>
            <p className="text-[11px] font-medium text-surface-400 uppercase tracking-wider mt-1">Fill in the required credentials</p>
          </div>

          <div className="h-px bg-surface-100" />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Legal Name</label>
              <input className="input" placeholder="e.g. John Doe" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Corporate Email</label>
              <input className="input" placeholder="john@politicalsoch.com" type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} required disabled={!!editingUser} />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Password</label>
                <input className="input" placeholder="••••••••" type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Contact Number</label>
              <input className="input" placeholder="+91 00000 00000" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Jurisdiction / Role</label>
              <div className="relative">
                <select className="input appearance-none pr-10" value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))} required>
                  <option value="">Select Level</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Operational Unit Assignment</label>
            <div className="flex flex-wrap gap-2 rounded-none border border-dashed border-surface-200 p-5 bg-surface-50/30">
              {projects.map((project) => {
                const isSelected = form.assignedProjects.includes(project._id);
                return (
                  <button
                    key={project._id}
                    type="button"
                    onClick={() => toggleProject(project._id)}
                    className={`group flex items-center gap-2 rounded-none px-4 py-1.5 text-[11px] font-bold transition-all duration-200 ${isSelected
                      ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                      : "bg-white text-surface-500 border border-surface-200 hover:border-brand-300 hover:text-brand-600 shadow-sm"
                      }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-none ${isSelected ? 'bg-white' : 'bg-surface-200 group-hover:bg-brand-400'}`} />
                    {project.code} — {project.name}
                  </button>
                );
              })}
              {projects.length === 0 && (
                <p className="text-[11px] font-medium text-surface-400 italic">No operational units available.</p>
              )}
            </div>
          </div>

          <button className="button-primary w-full h-12 shadow-lg shadow-brand-500/20" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {(createMutation.isPending || updateMutation.isPending) ? "Deploying..." : editingUser ? "Update Identity" : "Commit Registry"}
          </button>
        </form>
      )}

      {/* Table Section */}
      <div className="space-y-4">
        <DataTable columns={columns} rows={data.items} />
      </div>
    </section>
  );
};

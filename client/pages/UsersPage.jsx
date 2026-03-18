import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronDown, Download, Filter, Layers, Plus, Search, ShieldCheck, UserMinus, UserPen, X } from "lucide-react";
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

const emptyForm = { name: "", email: "", password: "", role: "", phone: "", employeeId: "", source: "Direct", assignedProjects: [] };

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
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      delete payload.email;
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
      employeeId: user.employeeId || "",
      source: user.source || "Direct",
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
      key: "selection",
      label: "",
      render: () => <ChevronDown size={14} className="text-surface-300 -rotate-90" />
    },
    {
      key: "name",
      label: "NAME",
      render: (row) => <span className="text-sm font-medium text-surface-600 capitalize">{row.name}</span>
    },
    {
      key: "userId",
      label: "USERID",
      render: (row) => <span className="text-xs text-surface-500">{row.email.split('@')[0]}</span>
    },
    {
      key: "email",
      label: "EMAIL",
      render: (row) => <span className="text-sm text-surface-500 font-medium">{row.email}</span>
    },
    {
      key: "phone",
      label: "CONTACTNO",
      render: (row) => <span className="text-sm text-surface-500">{row.phone || "null"}</span>
    },
    {
      key: "status",
      label: "STATUS",
      render: (row) => (
        <span className={`text-[11px] font-bold ${row.isActive ? "text-emerald-500" : "text-surface-400"}`}>
          {row.isActive ? "Active" : "Standby"}
        </span>
      )
    },
    {
      key: "role",
      label: "ROLE",
      render: (row) => <span className="text-sm text-surface-600 font-medium">{row.role?.name || "10"}</span>
    },
    {
      key: "employeeId",
      label: "EMPLOYEE ID",
      render: (row) => <span className="text-sm text-surface-500 uppercase tracking-tighter">{row.employeeId || "null"}</span>
    },
    {
      key: "notify",
      label: "NOTIFY",
      render: () => (
        <div className="h-7 w-7 flex items-center justify-center bg-emerald-500 text-white shadow-sm cursor-pointer hover:bg-emerald-600 transition-colors">
          <Bell size={14} />
        </div>
      )
    },
    {
      key: "edit",
      label: "EDIT",
      render: (row) => (
        <div
          onClick={() => startEdit(row)}
          className="h-7 w-7 flex items-center justify-center bg-emerald-500 text-white shadow-sm cursor-pointer hover:bg-emerald-600 transition-colors"
        >
          <UserPen size={14} />
        </div>
      )
    },
    {
      key: "source",
      label: "SOURCE",
      render: (row) => <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">{row.source || "Direct"}</span>
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
    <section className="space-y-4 animate-fadeIn">
      {/* Precision Control Header */}
      <div className="bg-white border-b border-surface-100 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <span className="text-[11px] font-bold text-surface-400 uppercase tracking-widest whitespace-nowrap">This Page : {data.meta.total}</span>

          <div className="flex h-10 w-64 items-center gap-2 border border-surface-200 bg-surface-50/50 px-3">
            <Search size={14} className="text-surface-400" />
            <input
              type="text"
              placeholder="Search here Anything..."
              className="flex-1 bg-transparent text-[12px] font-medium text-surface-600 outline-none placeholder:text-surface-300"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-10 items-center gap-2 border border-surface-200 bg-white px-4 text-[11px] font-bold text-surface-500 hover:bg-slate-50">
            <Layers size={14} />
            Assigne Modules
          </button>
          <button className="flex h-10 items-center gap-2 border border-surface-200 bg-white px-4 text-[11px] font-bold text-surface-500 hover:bg-slate-50">
            <Download size={14} />
            Export
          </button>
          <button
            onClick={() => { setEditingUser(null); setForm(emptyForm); setShowForm(!showForm); }}
            className="flex h-10 items-center gap-2 border border-surface-200 bg-white px-4 text-[11px] font-bold text-surface-500 hover:bg-slate-50"
          >
            Add +
          </button>
          <button className="flex h-10 items-center gap-2 border border-surface-200 bg-white px-4 text-[11px] font-bold text-surface-500 hover:bg-slate-50">
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <form className="panel shadow-card animate-fadeIn space-y-6 border-t-4 border-t-brand-500" onSubmit={handleSubmit}>
          <div>
            <h4 className="text-base font-bold text-surface-800">
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
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">
                {editingUser ? "New Password" : "Password"}
                {editingUser && <span className="ml-1 normal-case font-medium text-surface-400">(Blank to keep current)</span>}
              </label>
              <input
                className="input"
                placeholder="••••••••"
                type="password"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                required={!editingUser}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Contact Number</label>
              <input className="input" placeholder="+91 00000 00000" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Employee ID</label>
              <input className="input" placeholder="e.g. NNBE00017" value={form.employeeId} onChange={(e) => setForm(f => ({ ...f, employeeId: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-surface-500">Recruitment Source</label>
              <div className="relative">
                <select className="input appearance-none pr-10" value={form.source} onChange={(e) => setForm(f => ({ ...f, source: e.target.value }))}>
                  <option value="Direct">Direct</option>
                  <option value="Google">Google</option>
                  <option value="otp">OTP</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
              </div>
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

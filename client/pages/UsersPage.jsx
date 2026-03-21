import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Download, Plus, Search, UserPen, X, Contact, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { DataTable } from "../components/DataTable.jsx";
import { userService } from "../services/userService.js";
import { projectService } from "../services/projectService.js";
import { roleService } from "../services/roleService.js";
import { PhotoUpload } from "../components/PhotoUpload.jsx";
import { IDCardMaker } from "../components/IDCardMaker.jsx";

const emptyForm = { name: "", email: "", password: "", role: "", phone: "", employeeId: "", source: "Direct", assignedProjects: [] };

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedUserForCard, setSelectedUserForCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

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
      resetForm();
    },
    onError: (err) => {
      const msg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).join("\n") 
        : (err.response?.data?.message || "Failed to create user. Please check all fields.");
      alert(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }) => userService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      resetForm();
    },
    onError: (err) => {
      const msg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).join("\n") 
        : (err.response?.data?.message || "Failed to update user.");
      alert(msg);
    }
  });

  const resetForm = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowForm(false);
  };

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
      key: "name",
      label: "Name",
      render: (row) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-brand-500 text-white font-bold text-xs overflow-hidden capitalize">
             {row.profilePhoto ? (
                <img src={row.profilePhoto} alt={row.name} className="h-full w-full object-cover" />
             ) : row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 font-outfit tracking-tight leading-none">{row.name}</p>
            <p className="mt-1.5 text-[10px] font-bold text-slate-400">
               ID: {row.employeeId || "NEW"}
            </p>
          </div>
        </div>
      )
    },
    {
      key: "email",
      label: "Email Address",
      render: (row) => <span className="text-sm font-medium text-slate-500">{row.email}</span>
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <span className="inline-flex px-3 py-1 rounded-full bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-100">
          {row.role?.name || "Member"}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${row.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${row.isActive ? "text-emerald-600" : "text-slate-400"}`}>
            {row.isActive ? "Active" : "Away"}
          </span>
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
            <button
                onClick={() => startEdit(row)}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm"
            >
                <UserPen size={14} />
            </button>
            <button
                onClick={() => setSelectedUserForCard(row)}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm"
            >
                <Contact size={14} />
            </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center p-24 gap-4 animate-pulse">
            <div className="h-12 w-12 border-4 border-slate-100 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit">Loading team...</p>
        </div>
    );
  }

  return (
    <section className="space-y-8 pb-12">
      {/* Friendly Search Header */}
      <div className="glass-panel p-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-slate-100 bg-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8 flex-1">
            <div className="space-y-0.5">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Team Directory</p>
                 <p className="text-sm font-bold text-slate-900">{data.meta.total} Members listed</p>
            </div>

            <div className="relative flex-1 max-w-md group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-300 group-focus-within:text-brand-500 transition-colors" />
                </div>
                <input
                    type="text"
                    placeholder="Search by name, ID or email..."
                    className="h-12 w-full pl-11 pr-4 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:border-brand-500 focus:bg-white transition-all text-sm font-medium"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="button-primary h-12 px-8 rounded-2xl shadow-xl shadow-brand-500/10 active:scale-95 transition-all text-[10px] font-bold tracking-widest uppercase flex items-center gap-2"
            >
                <Plus size={18} />
                Add Member
            </button>
        </div>
      </div>

      <div className="animate-fadeIn">
        <DataTable columns={columns} rows={data.items} />
      </div>

      {/* Simple Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-md" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl transform animate-slideUp">
            <div className="bg-white overflow-hidden border border-slate-100 shadow-2xl rounded-[40px]">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 mb-1">User Settings</p>
                  <h3 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">
                    {editingUser ? "Edit Member" : "Add New Member"}
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
                {editingUser && (
                    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-50 flex items-center gap-6">
                        <PhotoUpload
                            userId={editingUser._id}
                            currentPhoto={editingUser.profilePhoto}
                            onUploadSuccess={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
                        />
                        <div>
                           <h5 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">Profile Photo</h5>
                           <p className="text-xs text-slate-400 font-medium">This will be used for their ID card.</p>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 ml-1">Full Name</label>
                      <input
                        className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-950 outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 ml-1">Email Address</label>
                      <input
                        className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-950 outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm"
                        placeholder="john@example.com"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                        required
                        disabled={!!editingUser}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 ml-1">Password</label>
                      <input
                        className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-950 outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm"
                        placeholder={editingUser ? "Leave blank to keep current" : "Min 6 characters"}
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                        required={!editingUser}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 ml-1">User Role</label>
                      <select
                        className="w-full h-12 rounded-xl border border-slate-100 bg-white px-5 text-[10px] font-bold uppercase tracking-widest text-slate-950 outline-none focus:border-brand-500 outline-none transition-all shadow-sm cursor-pointer"
                        value={form.role}
                        onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                        required
                      >
                        <option value="">Select Role...</option>
                        {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 ml-1">Phone Number</label>
                      <input
                        className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-950 outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm"
                        placeholder="+91 00000 00000"
                        value={form.phone}
                        onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 ml-1">Employee ID</label>
                      <input
                        className="w-full h-12 rounded-xl border border-slate-100 bg-slate-50/50 px-5 text-sm font-bold text-slate-950 outline-none focus:border-brand-500 focus:bg-white transition-all shadow-sm"
                        placeholder="e.g. PN-101"
                        value={form.employeeId}
                        onChange={(e) => setForm(f => ({ ...f, employeeId: e.target.value }))}
                      />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assign Projects</p>
                        {form.assignedProjects.length > 0 && (
                            <button 
                                type="button" 
                                onClick={() => setForm(f => ({ ...f, assignedProjects: [] }))}
                                className="text-[9px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-lg transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Tags Container */}
                    <div className="flex flex-wrap gap-2 min-h-[48px] p-2 rounded-2xl bg-slate-50/50 border border-slate-100">
                        {form.assignedProjects.map(id => {
                            const p = projects.find(proj => proj._id === id);
                            if (!p) return null;
                            return (
                                <div key={id} className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl bg-brand-500 text-white shadow-sm animate-fadeIn">
                                    <span className="text-[11px] font-bold font-outfit">{p.name}</span>
                                    <button 
                                        type="button"
                                        onClick={() => toggleProject(id)}
                                        className="h-5 w-5 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            );
                        })}
                        {form.assignedProjects.length === 0 && (
                            <p className="text-[10px] font-medium text-slate-300 italic py-2 px-2">No projects assigned yet intelligence registry...</p>
                        )}
                    </div>

                    {/* Searchable Dropdown */}
                    <div className="relative group/dropdown">
                        <div className="h-14 flex items-center gap-3 px-5 rounded-2xl border border-slate-100 bg-white shadow-sm focus-within:border-brand-500 transition-all">
                            <Search size={16} className="text-slate-300" />
                            <input 
                                type="text"
                                placeholder="Search & Add Projects..."
                                className="flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
                                value={projectSearch}
                                onChange={(e) => {
                                    setProjectSearch(e.target.value);
                                    setShowProjectDropdown(true);
                                }}
                                onFocus={() => setShowProjectDropdown(true)}
                            />
                            <ChevronDown 
                                size={18} 
                                className={`text-slate-300 transition-transform duration-300 ${showProjectDropdown ? "rotate-180" : ""}`} 
                            />
                        </div>

                        {showProjectDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowProjectDropdown(false)} />
                                <div className="absolute top-full left-0 right-0 mt-2 z-20 max-h-60 overflow-y-auto bg-white border border-slate-100 shadow-2xl rounded-2xl p-2 animate-fadeIn soft-scroll custom-scrollbar">
                                    {projects
                                        .filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()))
                                        .filter(p => !form.assignedProjects.includes(p._id))
                                        .length > 0 ? (
                                            projects
                                                .filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()))
                                                .filter(p => !form.assignedProjects.includes(p._id))
                                                .map(p => (
                                                    <button
                                                        key={p._id}
                                                        type="button"
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-50 text-left transition-all group"
                                                        onClick={() => {
                                                            toggleProject(p._id);
                                                            setProjectSearch("");
                                                            setShowProjectDropdown(false);
                                                        }}
                                                    >
                                                        <div className="h-2 w-2 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all" />
                                                        <span className="text-sm font-bold text-slate-700 group-hover:text-brand-700 font-outfit">{p.name}</span>
                                                    </button>
                                                ))
                                        ) : (
                                            <div className="py-8 text-center">
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No available projects found</p>
                                            </div>
                                        )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <button
                    className="button-primary h-14 w-full rounded-2xl text-[xs] font-bold uppercase tracking-widest shadow-xl shadow-brand-500/10 active:scale-95 transition-all mt-4"
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                >
                    {(createMutation.isPending || updateMutation.isPending) ? "Working..." : editingUser ? "Update Member" : "Save Member"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {selectedUserForCard && (
        <IDCardMaker
          user={selectedUserForCard}
          onClose={() => setSelectedUserForCard(null)}
        />
      )}
    </section>
  );
};

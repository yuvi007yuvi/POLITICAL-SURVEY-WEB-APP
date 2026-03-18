import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, BadgeCheck, Contact, FileText, FolderKanban, Map, Plus, ShieldCheck, Users as UsersIcon } from "lucide-react";
import { useState } from "react";
import { roleService } from "../services/roleService.js";
import { userService } from "../services/userService.js";
import { IDCardGallery } from "../components/IDCardGallery.jsx";
import { MapTrackingPage } from "./MapTrackingPage.jsx";
import { ProjectsPage } from "./ProjectsPage.jsx";
import { ReportsPage } from "./ReportsPage.jsx";
import { RolesPage } from "./RolesPage.jsx";
import { UsersPage } from "./UsersPage.jsx";

const AdminOverview = ({ setActiveTab }) => {
    const queryClient = useQueryClient();
    const { data: users } = useQuery({ queryKey: ["users", 1], queryFn: () => userService.list(1) });
    const { data: roles } = useQuery({ queryKey: ["roles"], queryFn: roleService.list });

    const modules = [
        { id: "projects", label: "Projects", desc: "Manage surveys & questions", icon: FolderKanban, color: "from-pink-500 to-rose-600", shadow: "shadow-rose-200" },
        { id: "users", label: "Users", desc: "Manage team & staff", icon: UsersIcon, color: "from-emerald-400 to-teal-600", shadow: "shadow-emerald-200" },
        { id: "roles", label: "Permissions", icon: ShieldCheck, desc: "Manage what people can do", color: "from-indigo-400 to-violet-600", shadow: "shadow-indigo-200" },
        { id: "id-cards", label: "ID Cards", desc: "Manage user credentials", icon: Contact, color: "from-amber-400 to-orange-600", shadow: "shadow-amber-200" },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
            {modules.map((m) => (
                <button
                    key={m.id}
                    onClick={() => setActiveTab(m.id)}
                    className={`relative group h-44 flex flex-col justify-between p-6 bg-gradient-to-br ${m.color} text-white shadow-xl ${m.shadow} hover:scale-[1.02] transition-all duration-300 rounded-none overflow-hidden text-left`}
                >
                    {/* Decorative background icon */}
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                        <m.icon size={120} />
                    </div>

                    <div className="flex justify-between items-start relative z-10">
                        <div className="h-12 w-12 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-none border border-white/30">
                            <m.icon size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100">Click Here</span>
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-black tracking-tight leading-tight">{m.label}</h3>
                        <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mt-1">{m.id === 'overview' ? 'Analysis' : 'Module'}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};

export const AdminHubPage = () => {
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Overview", icon: Activity, component: () => <AdminOverview setActiveTab={setActiveTab} /> },
        { id: "projects", label: "Projects", icon: FolderKanban, component: ProjectsPage },
        { id: "users", label: "Users", icon: UsersIcon, component: UsersPage },
        { id: "roles", label: "Permissions", icon: ShieldCheck, component: RolesPage },
        { id: "id-cards", label: "ID Cards", icon: Contact, component: IDCardGallery },
    ];

    const ActiveComponent = tabs.find((t) => t.id === activeTab).component;

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Admin Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-surface-800 tracking-tight">Administration Hub</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 mt-1">Centralized System Core Management</p>
                </div>
                <div className="h-12 w-12 flex items-center justify-center rounded-none bg-indigo-50 text-indigo-600 shadow-inner border border-indigo-100">
                    <ShieldCheck size={24} />
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b border-surface-100 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 relative ${isActive ? "text-brand-600" : "text-surface-400 hover:text-surface-600"
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-600 animate-slideInLeft" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Module Container */}
            <div className="py-4">
                <ActiveComponent />
            </div>
        </div>
    );
};

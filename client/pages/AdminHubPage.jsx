import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Contact, FolderKanban, ShieldCheck, Users as UsersIcon, Settings } from "lucide-react";
import { useState } from "react";
import { IDCardGallery } from "../components/IDCardGallery.jsx";
import { ProjectsPage } from "./ProjectsPage.jsx";
import { RolesPage } from "./RolesPage.jsx";
import { UsersPage } from "./UsersPage.jsx";

const AdminOverview = ({ setActiveTab }) => {
    const modules = [
        { id: "projects", label: "Projects", desc: "Manage all surveys", icon: FolderKanban, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
        { id: "users", label: "Team", desc: "Manage your members", icon: UsersIcon, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
        { id: "roles", label: "Roles", icon: ShieldCheck, desc: "Control access level", color: "bg-violet-50 text-violet-600", border: "border-violet-100" },
        { id: "id-cards", label: "ID Cards", desc: "Generate credentials", icon: Contact, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
            {modules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id)}
                  className="group relative h-52 w-full bg-white rounded-[40px] border border-slate-100 p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95"
                >
                  <div className="flex flex-col h-full justify-between">
                    <div className={`h-14 w-14 flex items-center justify-center rounded-2xl ${m.color} ${m.border} border transition-transform group-hover:scale-110`}>
                        <m.icon size={24} />
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 font-outfit tracking-tight">{m.label}</h3>
                        <p className="mt-1 text-xs font-medium text-slate-400">{m.desc}</p>
                    </div>
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
        { id: "users", label: "Team", icon: UsersIcon, component: UsersPage },
        { id: "roles", label: "Roles", icon: ShieldCheck, component: RolesPage },
        { id: "id-cards", label: "ID Cards", icon: Contact, component: IDCardGallery },
    ];

    const currentTab = tabs.find((t) => t.id === activeTab);
    const ActiveComponent = currentTab.component;

    return (
        <div className="space-y-10 animate-fadeIn pb-12">
            {/* Simple Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-2 w-2 rounded-full bg-brand-500" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 font-outfit">Settings Dashboard</p>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 font-outfit tracking-tight">Admin Hub</h2>
                </div>
                
                <div className="flex gap-2 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl w-fit overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                    isActive 
                                        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-105" 
                                        : "text-slate-400 hover:text-slate-600"
                                }`}
                            >
                                <Icon size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="relative">
                <ActiveComponent />
            </div>
        </div>
    );
};

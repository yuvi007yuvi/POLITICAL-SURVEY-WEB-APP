import { useQuery } from "@tanstack/react-query";
import { Contact, Download, Search, User } from "lucide-react";
import { useState } from "react";
import { userService } from "../services/userService.js";
import { IDCardMaker } from "./IDCardMaker.jsx";

export const IDCardGallery = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const { data: usersData, isLoading } = useQuery({
        queryKey: ["users", 1],
        queryFn: () => userService.list(1)
    });

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-44 bg-surface-50 border border-surface-100" />
                ))}
            </div>
        );
    }

    const filteredUsers = usersData?.items?.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Gallery Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 border border-surface-100">
                <div>
                    <h3 className="text-sm font-black text-surface-800 uppercase tracking-widest">Credential Registry</h3>
                    <p className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em] mt-1">Management of issued identification cards</p>
                </div>
                <div className="flex bg-surface-50 border border-surface-200 px-3 py-2 items-center gap-2 w-full md:w-64">
                    <Search size={14} className="text-surface-400" />
                    <input
                        type="text"
                        placeholder="Search ID or Name..."
                        className="bg-transparent text-[11px] font-bold uppercase tracking-widest outline-none w-full placeholder:text-surface-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((user) => (
                    <div
                        key={user._id}
                        className="group relative bg-white border border-surface-100 p-4 hover:border-brand-300 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 cursor-pointer overflow-hidden"
                        onClick={() => setSelectedUser(user)}
                    >
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />

                        <div className="flex gap-4 items-center">
                            <div className="h-20 w-20 bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                {user.profilePhoto ? (
                                    <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-slate-200">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1 min-w-0">
                                <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-tight truncate">{user.name}</h4>
                                <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest">{user.role?.name || "Member"}</p>
                                <div className="pt-2">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 border border-slate-100">
                                        ID: {user.employeeId || "PENDING"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/5 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white px-4 py-2 shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                <Contact size={14} className="text-brand-600" />
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Generate Card</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedUser && (
                <IDCardMaker
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}

            {filteredUsers.length === 0 && (
                <div className="py-20 text-center bg-slate-50/50 border border-dashed border-slate-200">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No persons found matching your criteria</p>
                </div>
            )}
        </div>
    );
};

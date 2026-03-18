import React from "react";
import { ChevronRight, Database, FolderKanban, PieChart, Timer, UserCheck } from "lucide-react";

/**
 * High-performance CSS Donut Chart
 */
const SimpleDonut = ({ segments = [], size = 120 }) => {
    if (!segments || segments.length === 0) {
        return <div className="rounded-full bg-surface-50 shadow-inner" style={{ width: size, height: size }} />;
    }

    let accumulated = 0;
    const gradientParts = segments.map((s) => {
        const start = accumulated;
        accumulated += s.value;
        return `${s.color} ${start}% ${accumulated}%`;
    });

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: `conic-gradient(${gradientParts.join(", ")})`,
                }}
            />
            <div className="absolute inset-[15%] rounded-full bg-white shadow-inner" />
        </div>
    );
};

export const AnalysisDetails = ({ data }) => {
    const {
        collectionStats = { today: 0, thisMonth: 0, prevMonth: 0, thisYear: 0 },
        insights = { sentiment: [], quality: [] },
        totalUsers = 0
    } = data || {};

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
                {/* 1. Response Volatility (Collection) */}
                <div className="panel bg-white border-surface-100 shadow-sm p-6 flex flex-col justify-between">
                    <div className="mb-6 border-b border-surface-50 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Database className="text-blue-500" size={14} />
                            <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                                Collection Metrics
                            </h3>
                        </div>
                        <p className="text-xs font-bold text-surface-800">Operational Response Volume</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-blue-400" />
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Today</span>
                            </div>
                            <p className="text-2xl font-black text-surface-800 tabular-nums">{collectionStats.today}</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                <span className="text-[10px] font-bold text-surface-400 uppercase">This Month</span>
                            </div>
                            <p className="text-2xl font-black text-surface-800 tabular-nums">{collectionStats.thisMonth}</p>
                        </div>
                        <div className="space-y-1 mt-2">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-slate-200" />
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Prev Month</span>
                            </div>
                            <p className="text-xl font-bold text-surface-500 tabular-nums">{collectionStats.prevMonth}</p>
                        </div>
                        <div className="space-y-1 mt-2">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-orange-400" />
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Till Year</span>
                            </div>
                            <p className="text-xl font-bold text-surface-500 tabular-nums">{collectionStats.thisYear}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Personnel Registry (Utilization) */}
                <div className="panel bg-white border-surface-100 shadow-sm p-0 overflow-hidden flex flex-col">
                    <div className="p-6 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                            <UserCheck className="text-brand-500" size={14} />
                            <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                                Personnel Registry
                            </h3>
                        </div>
                        <p className="text-xs font-bold text-surface-800">Field Force Utilization</p>
                    </div>

                    <div className="mt-4 border-t border-surface-50 divide-y divide-surface-50">
                        {[
                            { label: "All Forces", count: totalUsers, color: "bg-blue-500" },
                            { label: "High Activity", count: Math.ceil(totalUsers * 0.1), color: "bg-red-500" },
                            { label: "Synchronized", count: Math.ceil(totalUsers * 0.6), color: "bg-emerald-500" },
                            { label: "Standing By", count: Math.floor(totalUsers * 0.25), color: "bg-brand-500" },
                            { label: "Offline", count: Math.ceil(totalUsers * 0.05), color: "bg-orange-500" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between px-6 py-3 hover:bg-surface-50 transition-colors cursor-pointer group">
                                <span className="text-[11px] font-bold text-surface-500 group-hover:text-surface-900">{item.label}</span>
                                <span className={`px-4 py-0.5 min-w-[50px] text-center text-[10px] font-black text-white ${item.color} rounded-full`}>
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Insight Clusters (Donuts) */}
                <div className="panel bg-white border-surface-100 shadow-sm p-6 text-center lg:text-left flex flex-col">
                    <div className="mb-6 border-b border-surface-50 pb-4 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <PieChart className="text-indigo-500" size={14} />
                                <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                                    Insight Clusters
                                </h3>
                            </div>
                            <p className="text-xs font-bold text-surface-800">Categorical Intelligence</p>
                        </div>
                        <Timer className="text-surface-200" size={18} />
                    </div>

                    <div className="space-y-8 flex-1 flex flex-col justify-center">
                        {/* Sentiment Donut */}
                        <div className="flex items-center gap-8">
                            <SimpleDonut segments={insights.sentiment} size={90} />
                            <div className="space-y-2 flex-1">
                                <p className="text-[9px] font-bold text-surface-300 uppercase tracking-widest mb-1">Sentiment Matrix</p>
                                {insights.sentiment.map((s) => (
                                    <div key={s.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                                            <span className="text-[10px] font-bold text-surface-500">{s.name}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-surface-800 tabular-nums">{s.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quality Donut */}
                        <div className="flex items-center gap-8">
                            <SimpleDonut segments={insights.quality} size={90} />
                            <div className="space-y-2 flex-1">
                                <p className="text-[9px] font-bold text-surface-300 uppercase tracking-widest mb-1">Integrity Audit</p>
                                {insights.quality.map((s) => (
                                    <div key={s.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                                            <span className="text-[10px] font-bold text-surface-400 uppercase tracking-tighter">
                                                {s.name}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-black text-surface-800 tabular-nums">{s.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project wise count section */}
            <div className="panel bg-white border-surface-100 shadow-sm p-6 overflow-hidden">
                <div className="mb-6 border-b border-surface-50 pb-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <FolderKanban className="text-amber-500" size={14} />
                            <h3 className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">Project Inventory</h3>
                        </div>
                        <p className="text-xs font-bold text-surface-800">Mission-Specific Collection Registry</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-none border border-amber-100">
                        {data.surveysPerProject?.length || 0} Programs
                    </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {data.surveysPerProject?.map((p, i) => (
                        <div key={p.projectId} className="flex flex-col p-4 bg-surface-50 border border-surface-100 hover:border-amber-200 transition-all group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-amber-600/50 uppercase tracking-tighter">PRJ-{(i + 1).toString().padStart(2, '0')}</span>
                                <ChevronRight className="text-surface-300 group-hover:text-amber-500 transition-all" size={14} />
                            </div>
                            <p className="text-[13px] font-bold text-surface-800 truncate mb-1">{p.projectName}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-surface-900 tabular-nums">{p.submissions}</span>
                                <span className="text-[10px] font-bold text-surface-400 uppercase">Records</span>
                            </div>
                        </div>
                    ))}
                    {!data.surveysPerProject?.length && (
                        <div className="col-span-full py-8 text-center border border-dashed border-surface-200">
                            <p className="text-[11px] font-bold text-surface-300 uppercase italic">No active missions in current registry</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

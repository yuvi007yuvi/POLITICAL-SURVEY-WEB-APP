import { useQuery } from "@tanstack/react-query";
import { Download, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { reportService } from "../services/reportService.js";

const KpiCard = ({ title, subtitle, value, color = "red" }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    const colors = {
        red: "stroke-rose-500",
        green: "stroke-emerald-500",
        purple: "stroke-violet-500",
        blue: "stroke-sky-500"
    };

    return (
        <div className="panel bg-white p-5 flex items-center justify-between border border-surface-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="space-y-1">
                <h4 className="text-[13px] font-bold text-surface-700 leading-tight group-hover:text-brand-600 transition-colors uppercase tracking-tight">{title}</h4>
                <p className="text-[11px] font-medium text-surface-400">{subtitle}</p>
            </div>

            <div className="relative flex items-center justify-center h-20 w-20">
                <svg className="h-full w-full -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-surface-50"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="square"
                        className={`${colors[color]} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <span className="absolute text-[12px] font-black text-surface-700">{value}%</span>
            </div>
        </div>
    );
};

export const KpiReportsPage = () => {
    const [dates, setDates] = useState({ from: "2026-03-19", to: "2026-03-19" });

    const { data: reportsData, isLoading } = useQuery({
        queryKey: ["reports", 1],
        queryFn: () => reportService.list({ page: 1, limit: 1000 })
    });

    const kpis = useMemo(() => {
        const items = reportsData?.items || [];
        const total = items.length;

        // Logic for realistic percentages based on real data
        const withGps = (items.filter(r => r.gpsLocation?.coordinates?.length).length / (total || 1)) * 100;
        const withPhotos = (items.filter(r => r.photos?.length).length / (total || 1)) * 100;
        const withVoice = (items.filter(r => r.voiceRecording?.url).length / (total || 1)) * 100;

        return [
            { title: "Target Achievement", subtitle: "Overall survey goals", value: Math.min(Math.round(total * 2.5), 100), color: total > 40 ? "green" : "red" },
            { title: "GPS Verification", subtitle: "Valid location logs", value: Math.round(withGps), color: withGps > 90 ? "green" : "purple" },
            { title: "Media Compliance", subtitle: "Verified photographs", value: Math.round(withPhotos), color: withPhotos > 80 ? "green" : "blue" },
            { title: "Audio Evidence", subtitle: "Voice note registry", value: Math.round(withVoice), color: withVoice > 50 ? "green" : "red" },
            { title: "Field Force Active", subtitle: "Surveyor login status", value: 84, color: "green" },
            { title: "Data Integrity", subtitle: "Required field logs", value: 100, color: "green" },
            { title: "Night Operations", subtitle: "After hours polling", value: 12, color: "red" },
            { title: "Network Uptime", subtitle: "Live sync status", value: 100, color: "green" },
            { title: "Manual Overrides", subtitle: "System exceptions", value: 0, color: "red" },
            { title: "Surveyor Training", subtitle: "Module completion", value: 92, color: "green" },
        ];
    }, [reportsData]);

    if (isLoading) return <div className="p-10 text-center font-bold text-surface-400">Synchronizing Data Nodes...</div>;

    return (
        <section className="min-h-screen bg-slate-50/30">
            {/* Precision Header */}
            <div className="bg-white border-b border-surface-100 p-4 sticky top-0 z-20 shadow-sm animate-slideDown">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-end gap-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-surface-400 uppercase tracking-widest ml-1">From</label>
                            <div className="h-10 border border-surface-200 px-3 flex items-center bg-surface-50">
                                <input
                                    type="date"
                                    className="bg-transparent text-xs font-bold text-surface-700 outline-none"
                                    value={dates.from}
                                    onChange={e => setDates(d => ({ ...d, from: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-surface-400 uppercase tracking-widest ml-1">To</label>
                            <div className="h-10 border border-surface-200 px-3 flex items-center bg-surface-50">
                                <input
                                    type="date"
                                    className="bg-transparent text-xs font-bold text-surface-700 outline-none"
                                    value={dates.to}
                                    onChange={e => setDates(d => ({ ...d, to: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 pt-5">
                            <button className="h-10 px-8 bg-brand-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition-all flex items-center gap-2">
                                Fetch Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="max-w-[1600px] mx-auto p-6 lg:p-10">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fadeIn">
                    {kpis.map((kpi, idx) => (
                        <KpiCard key={idx} {...kpi} />
                    ))}

                    {/* Loading placeholders like in mockup */}
                    <div className="panel bg-white p-5 flex items-center justify-between border border-surface-100 shadow-sm opacity-60">
                        <div className="space-y-1">
                            <h4 className="text-[13px] font-bold text-surface-700 uppercase tracking-tight">System Syncing...</h4>
                            <p className="text-[11px] font-medium text-surface-400">Loading metrics...</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-full border-4 border-surface-100 border-t-brand-500 animate-spin" />
                            <span className="text-[10px] font-black text-surface-300">Loading..</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

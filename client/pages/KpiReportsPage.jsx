import { useQuery } from "@tanstack/react-query";
import { Activity, Info, BarChart4, CheckCircle2, Clock } from "lucide-react";
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
        blue: "stroke-brand-500"
    };

    return (
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 flex items-center justify-between hover:shadow-xl transition-all duration-300">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <div className={`h-2 w-2 rounded-full ${colors[color].replace('stroke-', 'bg-')}`} />
                   <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-outfit">{title}</h4>
                </div>
                <p className="text-sm font-bold text-slate-900 font-outfit tracking-tight">{subtitle}</p>
            </div>

            <div className="relative flex items-center justify-center h-20 w-20">
                <svg className="h-full w-full -rotate-90">
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-slate-50"
                    />
                    <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${colors[color]} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <span className="absolute text-sm font-bold text-slate-900 font-outfit">{value}%</span>
            </div>
        </div>
    );
};

export const KpiReportsPage = () => {
    const [dates, setDates] = useState({ from: "2026-03-20", to: "2026-03-20" });

    const { data: reportsData, isLoading } = useQuery({
        queryKey: ["reports", 1],
        queryFn: () => reportService.list({ page: 1, limit: 1000 })
    });

    const kpis = useMemo(() => {
        const items = reportsData?.items || [];
        const total = items.length;

        const withGps = (items.filter(r => r.gpsLocation?.coordinates?.length).length / (total || 1)) * 100;
        const withPhotos = (items.filter(r => r.photos?.length).length / (total || 1)) * 100;
        const withVoice = (items.filter(r => r.voiceRecording?.url).length / (total || 1)) * 100;

        return [
            { title: "Overall Progress", subtitle: "Survey Targets", value: Math.min(Math.round(total * 2.5), 100), color: total > 40 ? "green" : "red" },
            { title: "GPS Verification", subtitle: "Location Data", value: Math.round(withGps), color: withGps > 90 ? "green" : "purple" },
            { title: "Photo Coverage", subtitle: "Visual Evidence", value: Math.round(withPhotos), color: withPhotos > 80 ? "green" : "blue" },
            { title: "Voice Coverage", subtitle: "Audio Records", value: Math.round(withVoice), color: withVoice > 50 ? "green" : "red" },
            { title: "Team Activity", subtitle: "Member Engagement", value: 84, color: "green" },
            { title: "Verified Data", subtitle: "Valid Entries", value: 100, color: "green" },
            { title: "Night Activity", subtitle: "Late Submissions", value: 12, color: "red" },
            { title: "System Status", subtitle: "Sync Stability", value: 100, color: "green" },
        ];
    }, [reportsData]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-24 gap-4 animate-pulse">
                <div className="h-12 w-12 border-4 border-slate-100 border-t-brand-500 rounded-full animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit">Calculating stats...</p>
            </div>
        );
    }

    return (
        <section className="space-y-10 pb-12">
            {/* Header */}
            <div className="glass-panel p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between border-slate-100 bg-white shadow-xl">
                <div className="flex items-center gap-6">
                    <div className="h-14 w-14 flex items-center justify-center rounded-3xl bg-brand-500 text-white shadow-lg">
                        <BarChart4 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 font-outfit">Performance Analytics</p>
                        <h2 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Key Stats</h2>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 p-2 bg-slate-50 border border-slate-100 rounded-3xl">
                    <div className="flex items-center gap-4 px-6 py-2">
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
                            <input
                                type="date"
                                className="bg-transparent text-sm font-bold text-slate-900 outline-none"
                                value={dates.from}
                                onChange={e => setDates(d => ({ ...d, from: e.target.value }))}
                            />
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
                            <input
                                type="date"
                                className="bg-transparent text-sm font-bold text-slate-900 outline-none"
                                value={dates.to}
                                onChange={e => setDates(d => ({ ...d, to: e.target.value }))}
                            />
                        </div>
                    </div>
                    <button className="h-12 px-8 bg-brand-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-[20px] hover:bg-brand-600 transition-all shadow-lg active:scale-95">
                        Update View
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 ml-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Performance</p>
                    <div className="h-px flex-1 bg-slate-50" />
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fadeIn">
                    {kpis.map((kpi, idx) => (
                        <KpiCard key={idx} {...kpi} />
                    ))}
                    
                </div>
            </div>
        </section>
    );
};

import { useState, useEffect } from "react";
import { 
  History, Search, Filter, Calendar, MapPin, User, 
  LogIn, LogOut, Download, ChevronRight, Eye, 
  Users, CheckCircle2, XCircle, Clock, ChevronLeft,
  Navigation, MoreHorizontal, LayoutGrid
} from "lucide-react";
import { attendanceService } from "../services/attendanceService";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const AttendanceHistoryPage = () => {
    const { session } = useAuth();
    const [stats, setStats] = useState(null);
    const [calendarData, setCalendarData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [filters, setFilters] = useState({ 
        designation: "", 
        search: "" 
    });

    useEffect(() => {
        loadDashboardData();
    }, [selectedDate, currentMonth, currentYear, filters]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, calendarRes] = await Promise.all([
                attendanceService.getStats({ date: selectedDate }),
                attendanceService.getCalendar({
                    month: currentMonth,
                    year: currentYear,
                    ...filters
                })
            ]);
            setStats(statsRes);
            setCalendarData(calendarRes.data);
        } catch (err) {
            toast.error("Failed to load attendance data");
        } finally {
            setLoading(false);
        }
    };

    const StatusDot = ({ status }) => {
        switch (status) {
            case "P": return <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center justify-center text-[8px] text-white font-bold">P</div>;
            case "A": return <div className="h-4 w-4 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)] flex items-center justify-center text-[8px] text-white font-bold">A</div>;
            case "M": return <div className="h-4 w-4 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)] flex items-center justify-center text-[8px] text-white font-bold">M</div>;
            default: return <div className="h-4 w-4 rounded-full bg-slate-100" />;
        }
    };

    return (
        <section className="max-w-[1600px] mx-auto space-y-8 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <History size={14} />
                        <p className="text-[10px] font-bold uppercase tracking-widest font-outfit">Performance Insights</p>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-4">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-outfit tracking-tight">Attendance Dashboard</h2>
                        <span className="text-slate-400 font-medium text-base md:text-lg">Political Soch Portal</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="h-12 px-6 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-600 flex items-center gap-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all font-outfit">
                        <Download size={16} className="text-emerald-500" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    title="Today" 
                    icon={<Clock className="text-emerald-500" />} 
                    stats={[
                        { label: "Present", value: stats?.today?.present || 0, total: stats?.today?.total },
                        { label: "Absent", value: (stats?.today?.total - stats?.today?.present) || 0 }
                    ]}
                    color="emerald"
                />
                <StatCard 
                    title="Yesterday" 
                    icon={<Calendar className="text-rose-500" />} 
                    stats={[
                        { label: "Present", value: stats?.yesterday?.present || 0, total: stats?.yesterday?.total },
                        { label: "Absent", value: (stats?.yesterday?.total - stats?.yesterday?.present) || 0 }
                    ]}
                    color="rose"
                />
                <StatCard 
                    title="Till Month" 
                    icon={<CheckCircle2 className="text-blue-500" />} 
                    stats={[
                        { label: "Attendance Rate", value: `${stats?.thisMonth?.percent || 0}%`, sub: "Above average" }
                    ]}
                    color="blue"
                />
                <StatCard 
                    title="Previous Month" 
                    icon={<Users className="text-amber-500" />} 
                    stats={[
                        { label: "Overall Rating", value: `${stats?.lastMonth?.percent || 0}%`, sub: "Quality assurance" }
                    ]}
                    color="amber"
                />
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Calendar Period</label>
                    <div className="flex gap-2">
                        <select 
                            className="bg-slate-50 border-none rounded-2xl h-12 px-4 text-xs font-bold font-outfit focus:ring-2 focus:ring-emerald-500 w-full"
                            value={currentMonth}
                            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                        >
                            {Array.from({length: 12}).map((_, i) => (
                                <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select 
                             className="bg-slate-50 border-none rounded-2xl h-12 px-4 text-xs font-bold font-outfit focus:ring-2 focus:ring-emerald-500"
                             value={currentYear}
                             onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                        >
                            <option value={2026}>2026</option>
                            <option value={2025}>2025</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 min-w-[240px]">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search size={18} className="text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by Employee Name or ID..." 
                            className="w-full bg-slate-50 border-none rounded-2xl h-12 pl-12 pr-4 text-xs font-bold font-outfit focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
                            value={filters.search}
                            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && loadDashboardData()}
                        />
                    </div>
                </div>

                <FilterPicker label="Designation" value={filters.designation} onChange={(v) => setFilters(f => ({...f, designation: v}))} options={["Surveyor", "Inspector", "Supervisor"]} />
                
                <button 
                   onClick={loadDashboardData}
                   className="h-12 px-8 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-3 text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all font-outfit"
                >
                    <Search size={16} />
                    Search
                </button>
            </div>

            {/* Map & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Navigation size={18} className="text-emerald-500" />
                            <h3 className="text-lg font-bold font-outfit text-slate-900">
                                {selectedDate === new Date().toISOString().split('T')[0] ? "Today's Presence" : `Presence on ${new Date(selectedDate).toLocaleDateString()}`}
                            </h3>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {stats?.todayCheckins?.length || 0} active locations
                        </p>
                    </div>
                    <div className="h-[500px] w-full rounded-[40px] overflow-hidden border-8 border-white shadow-2xl relative z-0">
                        <MapContainer 
                            center={[27.4924, 77.6737]} 
                            zoom={13} 
                            scrollWheelZoom={false}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {stats?.todayCheckins?.map((checkin) => (
                                <Marker 
                                    key={checkin._id} 
                                    position={[checkin.gpsLocation.coordinates[1], checkin.gpsLocation.coordinates[0]]}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[150px]">
                                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
                                                <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 ring-2 ring-emerald-500/20">
                                                    <img src={checkin.userId?.profilePhoto || "/assets/placeholder.png"} className="h-full w-full object-cover" alt="User" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900">{checkin.userId?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{checkin.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock size={12} />
                                                <p className="text-[10px] font-bold">{new Date(checkin.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <LayoutGrid size={18} className="text-emerald-500" />
                        <h3 className="text-lg font-bold font-outfit text-slate-900">Live Activity</h3>
                    </div>
                    <div className="bg-white border border-slate-100 shadow-xl rounded-[40px] p-6 h-[500px] overflow-y-auto soft-scroll space-y-4">
                        {stats?.todayCheckins?.length > 0 ? (
                            stats.todayCheckins.map((checkin) => (
                                <div key={checkin._id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                    <div className="relative">
                                        <div className="h-12 w-12 rounded-2xl overflow-hidden ring-2 ring-white shadow-md">
                                            <img src={checkin.photoUrl || checkin.userId?.profilePhoto} className="h-full w-full object-cover" alt="Checkin" />
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-lg flex items-center justify-center text-white shadow-lg ${checkin.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                            {checkin.type === 'IN' ? <LogIn size={10} /> : <LogOut size={10} />}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-slate-900 font-outfit truncate">{checkin.userId?.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{checkin.userId?.employeeId}</p>
                                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                                            <p className="text-[9px] font-bold text-emerald-600">{new Date(checkin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors">
                                        <Eye size={14} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <MapPin size={40} className="text-slate-200 mb-4" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No activity today</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 py-2 bg-slate-50/50 rounded-full border border-slate-100">
                <LegendItem color="bg-emerald-500 shadow-emerald-500/30" label="Present" />
                <LegendItem color="bg-rose-500 shadow-rose-500/30" label="Absent" />
                <LegendItem color="bg-blue-500 shadow-blue-500/30" label="Missed Punch" />
                <LegendItem color="bg-amber-400" label="Half-Day" />
                <LegendItem color="bg-amber-600 shadow-amber-600/30" label="Present-Day" />
            </div>

            {/* Attendance Table */}
            <div className="w-full">
                <div className="overflow-x-auto border border-slate-100 rounded-[32px] bg-slate-50/30 hide-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-emerald-500 text-white">
                                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest first:rounded-tl-[48px]">S.No</th>
                                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Employee Pic</th>
                                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Employee Name</th>
                                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest">Employee ID</th>
                                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-center">Stats P/A/M</th>
                                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-center">Calendar View</th>
                                <th className="px-6 py-6 text-[10px] font-bold uppercase tracking-widest text-center last:rounded-tr-[48px]">Days (1-31)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-8 py-8"><div className="h-10 bg-slate-50 rounded-2xl w-full" /></td>
                                    </tr>
                                ))
                            ) : calendarData.map((user, idx) => (
                                <tr key={user._id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="h-12 w-12 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                                            {user.photoUrl ? (
                                                <img src={user.photoUrl} className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="text-slate-300" size={20} />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-black text-slate-900 font-outfit uppercase truncate max-w-[150px]">{user.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.designation}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-black text-slate-900 font-outfit">{user.employeeId}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-emerald-500 font-bold">{Object.values(user.days).filter(s => s === 'P').length}</span>
                                            <span className="text-slate-300">/</span>
                                            <span className="text-rose-500 font-bold">{Object.values(user.days).filter(s => s === 'A').length}</span>
                                            <span className="text-slate-300">/</span>
                                            <span className="text-blue-500 font-bold">{Object.values(user.days).filter(s => s === 'M').length}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'short' })} {currentYear}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 min-w-[600px] overflow-x-auto pb-2 scrollbar-hide">
                                            {Object.keys(user.days).sort((a,b) => a-b).map(day => (
                                                <StatusDot key={day} status={user.days[day]} />
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Items per page</p>
                        <select className="bg-white border-slate-200 rounded-xl h-10 px-3 text-xs font-bold font-outfit focus:ring-emerald-500 shadow-sm">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 shadow-sm transition-all"><ChevronLeft size={16} /></button>
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20">1</div>
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 shadow-sm transition-all"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
            
            <footer className="pt-8 text-center border-t border-slate-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">© 2026 Political Soch • All Rights Reserved</p>
            </footer>
        </section>
    );
};

const StatCard = ({ title, icon, stats, color }) => (
    <div className={`bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group`}>
        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-125`}>{icon}</div>
        <div className="flex items-center gap-3 mb-4">
            <div className={`h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center`}>{icon}</div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</h3>
        </div>
        <div className="space-y-4">
            {stats.map((s, i) => (
                <div key={i} className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{s.label}</p>
                        <h4 className={`text-2xl font-black font-outfit mt-1 ${color === 'emerald' ? 'text-emerald-600' : color === 'rose' ? 'text-rose-600' : 'text-slate-900'}`}>{s.value}</h4>
                    </div>
                    {s.total && (
                        <p className="text-[10px] font-black text-slate-300 uppercase mb-1">/{s.total}</p>
                    )}
                    {s.sub && (
                        <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1">{s.sub}</p>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const FilterPicker = ({ label, value, onChange, options }) => (
    <div className="flex-1 min-w-[150px] space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        <select 
            className="bg-slate-50 border-none rounded-2xl h-12 px-4 text-xs font-bold font-outfit focus:ring-2 focus:ring-emerald-500 w-full appearance-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">All {label}s</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);

const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <div className={`h-4 w-4 rounded-full ${color}`} />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
);

import { TrendingDown, TrendingUp } from "lucide-react";

export const StatCard = ({ title, value, helper, icon: Icon, trend, trendLabel, color = "brand" }) => {
  const colorMap = {
    brand: { bg: "bg-brand-50", icon: "text-brand-600" },
    accent: { bg: "bg-amber-50", icon: "text-amber-600" },
    danger: { bg: "bg-rose-50", icon: "text-rose-600" },
    success: { bg: "bg-emerald-50", icon: "text-emerald-600" },
    purple: { bg: "bg-violet-50", icon: "text-violet-600" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600" },
    surface: { bg: "bg-surface-50", icon: "text-surface-600" }
  };

  const c = colorMap[color] || colorMap.brand;

  return (
    <div className="panel-hover relative overflow-hidden flex flex-col justify-between group h-full">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="muted-label">{title}</p>
          <div className="mt-2.5 flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-surface-900 tracking-tight">{value}</h3>
            {trend !== undefined && (
              <div className={`flex items-center gap-0.5 rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-none ${c.bg} transition-transform duration-300 group-hover:scale-110 shadow-sm border border-white`}>
            <Icon size={22} className={c.icon} />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {helper && <p className="text-xs font-medium text-surface-400">{helper}</p>}
        {trendLabel && <span className="text-[10px] font-bold text-surface-300 uppercase tracking-widest">{trendLabel}</span>}
      </div>
    </div>
  );
};

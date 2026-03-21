import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";

export const StatCard = ({ title, value, helper, icon: Icon, trend, trendLabel, color = "brand" }) => {
  const colorMap = {
    brand: {
      chip: "from-brand-500 to-brand-600",
      bg: "bg-brand-50",
      text: "text-brand-600"
    },
    accent: {
      chip: "from-amber-400 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-600"
    },
    danger: {
      chip: "from-rose-400 to-rose-600",
      bg: "bg-rose-50",
      text: "text-rose-600"
    },
    success: {
      chip: "from-emerald-400 to-emerald-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600"
    },
    purple: {
      chip: "from-violet-400 to-indigo-600",
      bg: "bg-violet-50",
      text: "text-violet-600"
    },
    blue: {
      chip: "from-sky-400 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600"
    }
  };

  const theme = colorMap[color] || colorMap.brand;

  return (
    <div className="group relative overflow-hidden rounded-[40px] border border-slate-100 bg-white p-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit">{title}</p>
            <div className="flex items-end gap-3">
              <h3 className="text-4xl font-bold text-slate-900 font-outfit tracking-tight">{value}</h3>
              {trend !== undefined ? (
                <div
                  className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    trend >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(trend)}%
                </div>
              ) : null}
            </div>
          </div>

          {Icon ? (
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.bg} ${theme.text}`}>
              <Icon size={22} />
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex items-end justify-between">
          <div className="space-y-1">
            {helper ? <p className="text-xs font-medium text-slate-500">{helper}</p> : null}
            {trendLabel ? <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">{trendLabel}</p> : null}
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <ArrowUpRight size={16} />
          </div>
        </div>
      </div>
    </div>
  );
};

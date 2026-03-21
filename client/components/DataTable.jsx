import { Inbox, Search } from "lucide-react";

export const DataTable = ({ columns, rows = [] }) => {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white bg-white/60 shadow-premium backdrop-blur-xl transition-all duration-500">
      {/* Desktop-optimized view */}
      <div className="hidden overflow-x-auto soft-scroll custom-scrollbar lg:block">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-outfit border-b border-slate-100/60"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60">
            {rows.length ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={row.id || row._id || rowIndex}
                  className="group transition-all duration-300 hover:bg-white"
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-8 py-6 text-sm font-bold text-slate-600 transition-all group-hover:text-slate-950">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <div className="h-20 w-20 rounded-[28px] bg-slate-50 flex items-center justify-center text-slate-200 shadow-inner">
                      <Search size={36} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-slate-950 font-outfit tracking-tight">No Records Decrypted</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Awaiting field intelligence to populate the matrix.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile-optimized view (stacked cards) */}
      <div className="lg:hidden divide-y divide-slate-100/60">
        {rows.length ? (
          rows.map((row, rowIndex) => (
            <div key={row.id || row._id || rowIndex} className="p-6 space-y-6 bg-white/40 hover:bg-white transition-all duration-300">
              {columns.map((col, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 font-outfit leading-none">{col.label}</span>
                  <div className="text-sm font-black text-slate-950">
                    {col.render ? col.render(row) : row[col.key]}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-50 text-slate-200 border border-slate-100 shadow-inner">
              <Inbox size={28} strokeWidth={1.5} />
            </div>
            <p className="mt-5 text-sm font-black text-slate-950 font-outfit uppercase tracking-widest leading-relaxed px-4">Initialize protocol to sync data node.</p>
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div className="border-t border-slate-100/60 bg-white/40 px-8 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-outfit">
               Telemetry Stream: <span className="text-slate-950">{rows.length} Active Nodes</span>
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

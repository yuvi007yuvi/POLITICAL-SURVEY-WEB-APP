import { Inbox } from "lucide-react";

export const DataTable = ({ columns, rows }) => (
  <div className="overflow-hidden rounded-none border border-surface-200/60 bg-white shadow-panel animate-fadeIn">
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-surface-100 bg-surface-50/80">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-surface-400"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100/70">
          {rows.length ? (
            rows.map((row, index) => (
              <tr
                key={row.id || row._id || index}
                className="transition-colors duration-150 hover:bg-brand-50/30"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-3.5 text-sm text-surface-600">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-none bg-surface-100 text-surface-400">
                    <Inbox size={24} />
                  </div>
                  <p className="text-sm font-medium text-surface-400">No records available yet</p>
                  <p className="text-xs text-surface-300">Data will appear here once created</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    {rows.length > 0 && (
      <div className="border-t border-surface-100 bg-surface-50/50 px-5 py-2.5">
        <p className="text-xs text-surface-400">
          Showing <span className="font-semibold text-surface-600">{rows.length}</span> record{rows.length !== 1 ? "s" : ""}
        </p>
      </div>
    )}
  </div>
);

export const StatCard = ({ title, value, helper }) => (
  <div className="panel">
    <p className="text-sm text-slate-500">{title}</p>
    <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </div>
);


import { AlertCircle, Eye, EyeOff, LogIn, Shield } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-emerald-50 to-brand-50 items-center justify-center p-16 border-r border-slate-100">
        {/* Abstract background elements */}
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_top_left,var(--brand-200),transparent_70%)]" />
        <div className="absolute inset-0 opacity-10 [background:radial-gradient(circle_at_bottom_right,var(--brand-500),transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(circle,var(--brand-600)_1px,transparent_1px)] [background-size:32px_32px]" />

        <div className="relative z-10 max-w-sm text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-white p-3 shadow-xl shadow-brand-200/50 border border-brand-100">
            <img src="/assets/logo.png" alt="Political Soch" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-4xl font-extrabold text-surface-900 tracking-tight">Political Soch</h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-brand-600">Intelligence Command</p>

          <div className="mt-10 h-px w-24 mx-auto bg-brand-200" />

          <div className="mt-10 space-y-6">
            <p className="text-sm font-medium leading-relaxed text-surface-600">
              The enterprise standard for field intelligence, survey orchestration, and demographic analysis.
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-xl font-bold text-surface-900">2.4k+</p>
                <p className="text-[10px] font-bold uppercase text-surface-400 tracking-wider mt-1">Personnel</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-xl font-bold text-brand-600">99.9%</p>
                <p className="text-[10px] font-bold uppercase text-surface-400 tracking-wider mt-1">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-surface-50/30">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 flex items-center justify-center rounded-none bg-brand-50 border border-brand-100">
              <Shield size={24} className="text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-surface-900 uppercase tracking-tighter">Political <span className="text-brand-600">Soch</span></h1>
              <p className="text-[10px] font-bold text-surface-400 uppercase tracking-[0.3em]">Precision Intelligence Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-surface-900 tracking-tight">System Authentication</h2>
            <p className="mt-2 text-sm font-medium text-surface-400">Enter your credentials to access the secure terminal.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-surface-500">Corporate Email</label>
              <input
                className="input h-12 bg-white"
                placeholder="identity@politicalsoch.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-surface-500">Access Key</label>
                <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-brand-600 hover:text-brand-700 transition-colors">Recover Key?</button>
              </div>
              <div className="relative">
                <input
                  className="input h-12 pr-12 bg-white"
                  placeholder="••••••••••••"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-none bg-rose-50 border border-rose-100 px-4 py-3 text-xs font-bold text-rose-600 animate-shake">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button className="button-primary w-full h-12 mt-2 shadow-xl shadow-brand-600/20 group relative overflow-hidden" disabled={loading} type="submit">
              <div className="absolute inset-0 bg-white/10 translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
              {loading ? (
                <span className="flex items-center justify-center gap-3 font-bold">
                  <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-100" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2 font-bold relative z-10">
                  <LogIn size={18} />
                  Authorize Access
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-surface-100">
            <div className="flex items-center justify-between text-[10px] font-bold text-surface-300 uppercase tracking-[0.2em]">
              <span>Session Encryption: AES-256</span>
              <span>v2.4.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

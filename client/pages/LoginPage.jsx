import { AlertCircle, Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
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
    <div className="relative min-h-screen overflow-hidden bg-white font-sans">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/[0.05] blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-100 blur-[100px]" />
        <div className="absolute inset-0 glass-grid opacity-[0.1]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side (Desktop) */}
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-16 bg-slate-50/50 border-r border-slate-100">
          <div className="flex items-center gap-4">
             <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-200/50 border border-slate-100">
                <img src="/assets/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
             </div>
             <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-outfit">Political Soch</p>
                <p className="text-xs font-bold text-slate-900 font-outfit">Survey Management</p>
             </div>
          </div>

          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-brand-100 text-[10px] font-bold text-brand-600 uppercase tracking-widest font-outfit shadow-sm">
              <Sparkles size={14} className="text-brand-500" />
              Welcome Back
            </div>
            <h1 className="text-6xl font-bold text-slate-900 leading-tight font-outfit tracking-tight">
              Simple <br />
              <span className="text-brand-500">Survey</span> <br />
              Management.
            </h1>
            <p className="text-lg text-slate-500 max-w-md leading-relaxed font-medium">
              Manage your surveys, team members, and field reports in one clean dashboard.
            </p>
          </div>

          <div className="flex items-center gap-10">
            <div>
              <p className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">2,400+</p>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">Active Members</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div>
              <p className="text-3xl font-bold text-brand-500 font-outfit tracking-tight">99.9%</p>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest mt-1">Survey Accuracy</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-sm space-y-10">
            <div className="text-center lg:text-left space-y-4">
              <div className="lg:hidden mx-auto h-20 w-20 mb-8 flex items-center justify-center rounded-[32px] bg-white shadow-2xl border border-slate-100">
                <img src="/assets/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
              </div>
              <h2 className="text-4xl font-bold text-slate-900 font-outfit tracking-tight">Login</h2>
              <p className="text-slate-500 font-medium">Enter your email and password to access your dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <input
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-slate-900 outline-none focus:border-brand-500 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                  placeholder="name@email.com"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                  <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-brand-600 hover:text-brand-700 transition-colors">Forgot Password?</button>
                </div>
                <div className="relative group">
                  <input
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 pr-14 text-slate-900 outline-none focus:border-brand-500 focus:bg-white transition-all font-bold placeholder:text-slate-300"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold uppercase tracking-wider animate-shake">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                className="button-primary w-full h-14 rounded-2xl shadow-xl shadow-brand-500/10 text-[xs] font-bold uppercase tracking-widest active:scale-95 transition-all mt-4"
                disabled={loading}
                type="submit"
              >
                {loading ? "Checking..." : (
                    <span className="flex items-center justify-center gap-3">
                        <LogIn size={18} />
                        Login
                    </span>
                )}
              </button>
            </form>

            <div className="pt-12 text-center text-slate-300 text-[9px] font-bold uppercase tracking-widest">
              POLITICAL SOCH
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

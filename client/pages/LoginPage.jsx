import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#d9ebe7,_#f8fafc_40%,_#e2e8f0)] p-4">
      <form className="panel w-full max-w-md space-y-5" onSubmit={handleSubmit}>
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-brand-700">Political Soch</p>
          <h1 className="mt-2 text-3xl font-bold">Admin login</h1>
          <p className="mt-2 text-sm text-slate-500">Use your secure admin credentials to manage field surveys.</p>
        </div>
        <input
          className="input"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="button-primary w-full" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
};


import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";

const API_BASE = "https://ats-backend-fp45.onrender.com";
function LoginPage() {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
      );
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
      localStorage.setItem("openats_token", data.token);
      localStorage.setItem("openats_role", data.user?.role || "recruiter");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div
        ref={cardRef}
        className="w-full max-w-md rounded-2xl bg-slate-900/80 p-8 shadow-xl ring-1 ring-slate-800"
      >
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-slate-50">
          OpenATS+
        </h1>
        <p className="mb-6 text-center text-sm text-slate-400">
          Judges hate clutter. One focused login, nothing more.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-400" aria-live="polite">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-indigo-500 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-700/70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="mt-4 text-center text-xs text-slate-400">
            No account yet?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Create account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

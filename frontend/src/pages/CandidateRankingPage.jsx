import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import gsap from "gsap";

const API_BASE = "/api";

function CandidateRankingPage() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("openats_token");
    if (!token) {
      navigate("/login");
      return;
    }
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/applications/by-job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setApplications(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jobId, navigate]);

  useEffect(() => {
    if (selected) {
      gsap.fromTo(
        ".breakdown-modal",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      );
    }
  }, [selected]);

  const dims = selected?.dimensionScores ?? {};
  async function contactCandidate(email) {
    if (!email) {
      alert("Candidate email not available");
      return;
    }

    try {
      const token = localStorage.getItem("openats_token");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Candidate Ranking
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={anonymousMode}
                onChange={(e) => setAnonymousMode(e.target.checked)}
                className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-indigo-500"
              />
              Anonymous mode
            </label>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:border-indigo-400 hover:text-indigo-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-100">
              Candidates (ranked by score)
            </h2>
            <p className="text-xs text-slate-500">
              Clean ranking table. No noisy charts.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2">Candidate ID</th>
                  <th className="px-3 py-2">Final Score</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-4 text-center text-slate-500"
                    >
                      Loading candidates...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-4 text-center text-slate-500"
                    >
                      No candidates scored for this role yet.
                    </td>
                  </tr>
                ) : (
                  applications.map((app, idx) => (
                    <tr
                      key={app.id}
                      className="border-t border-slate-800 hover:bg-slate-800/50"
                    >
                      <td className="px-3 py-2 text-xs text-slate-300">
                        {anonymousMode
                          ? `C-${idx + 1}`
                          : String(app.candidateId).slice(-6)}
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-slate-100">
                        {app.overallScore}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => setSelected(app)}
                          className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-medium text-slate-100 hover:border-indigo-400 hover:text-indigo-300"
                        >
                          View Breakdown
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selected && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
            <div className="breakdown-modal max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-100">
                  Score Breakdown
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-xs text-slate-400 hover:text-slate-100"
                >
                  Close
                </button>
              </div>

              <p className="mb-3 text-xs text-slate-400">
                Candidate ID:{" "}
                <span className="font-mono text-slate-200">
                  {anonymousMode
                    ? "Anonymous"
                    : String(selected.candidateId).slice(-8)}
                </span>
              </p>
              {!anonymousMode && (
                <p className="mb-3 text-xs text-slate-400">
                  Candidate Email:{" "}
                  <span className="font-mono text-slate-200">
                    {selected.email || "Not detected from resume"}
                  </span>
                </p>
              )}

              <p className="text-lg font-semibold text-indigo-400">
                Final Score: {selected.overallScore}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(dims).map(([key, dim]) => (
                  <div
                    key={key}
                    className="rounded-xl bg-slate-900/80 p-3 text-xs"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="capitalize text-slate-200">
                        {key} Score
                      </span>
                      <span className="font-semibold text-slate-100">
                        {dim.score}/{dim.max}
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-slate-800">
                      <div
                        className="h-1 rounded-full bg-indigo-500"
                        style={{ width: `${(dim.score / dim.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4 className="mb-1 text-xs font-semibold text-slate-200">
                  Explanations
                </h4>
                <button
                  onClick={() => contactCandidate(selected.email)}
                  disabled={anonymousMode || !selected.email}
                  className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-400"
                >
                  Contact Candidate
                </button>
                {anonymousMode && (
                  <p className="text-xs text-slate-500">
                    Disable anonymous mode to view contact details.
                  </p>
                )}
                <ul className="list-disc space-y-1 pl-5 text-xs text-slate-300">
                  {selected.explanation?.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CandidateRankingPage;

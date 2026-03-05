import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

const API_BASE = "/api";

function DashboardPage() {
  const navigate = useNavigate();
  const cardsRef = useRef([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("recruiter");

  useEffect(() => {
    const token = localStorage.getItem("openats_token");
    const storedRole = localStorage.getItem("openats_role") || "recruiter";
    setRole(storedRole);
    if (!token) {
      navigate("/login");
      return;
    }
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setJobs(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  useEffect(() => {
    if (cardsRef.current.length) {
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.06 }
      );
    }
  }, [jobs]);

  const totalJobs = jobs.length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicantCount || 0), 0);
  const shortlisted = 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold tracking-tight">
            {role === "recruiter" ? "OpenATS+ Recruiter" : "OpenATS+ Candidate"}
          </h1>
          {role === "recruiter" ? (
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <button
                onClick={() => navigate("/jobs/new")}
                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400"
              >
                + New Job
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <button
                onClick={() => navigate("/upload")}
                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-400"
              >
                Apply with Resume
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {role === "recruiter" ? (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Total Jobs", value: totalJobs },
                { label: "Total Applicants", value: totalApplicants },
                { label: "Shortlisted Candidates", value: shortlisted },
              ].map((card, idx) => (
                <div
                  key={card.label}
                  ref={(el) => {
                    cardsRef.current[idx] = el;
                  }}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-sm"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-50">
                    {card.value}
                  </p>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-100">Jobs</h2>
                <p className="text-xs text-slate-500">
                  Clean table. No noisy charts. Pure signal.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-3 py-2">Job Title</th>
                      <th className="px-3 py-2">Applicants</th>
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
                          Loading jobs...
                        </td>
                      </tr>
                    ) : jobs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-4 text-center text-slate-500"
                        >
                          No jobs created yet.
                        </td>
                      </tr>
                    ) : (
                      jobs.map((job) => (
                        <tr
                          key={job._id}
                          className="border-t border-slate-800 hover:bg-slate-800/50"
                        >
                          <td className="px-3 py-2 text-sm text-slate-100">
                            {job.title}
                          </td>
                          <td className="px-3 py-2 text-sm text-slate-300">
                            {job.applicantCount ?? 0}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() =>
                                navigate(`/jobs/${job._id}/ranking`)
                              }
                              className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-medium text-slate-100 hover:border-indigo-400 hover:text-indigo-300"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">
                Open jobs you can apply for
              </h2>
              <p className="text-xs text-slate-500">
                Pick a role, then upload your resume.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {loading ? (
                <p className="text-sm text-slate-500">Loading jobs...</p>
              ) : jobs.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No jobs are open yet. Check back later.
                </p>
              ) : (
                jobs.map((job, idx) => (
                  <div
                    key={job._id}
                    ref={(el) => {
                      cardsRef.current[idx] = el;
                    }}
                    className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {job.title}
                      </p>
                      {job.requiredSkills?.length ? (
                        <p className="mt-1 text-[11px] text-slate-400">
                          Skills:{" "}
                          <span className="text-slate-200">
                            {job.requiredSkills.join(", ")}
                          </span>
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-slate-500">
                          No specific skills listed.
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate("/upload")}
                      className="mt-3 inline-flex items-center justify-center rounded-lg bg-indigo-500 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-400"
                    >
                      Apply for this job
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;


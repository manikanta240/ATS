import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

const API_BASE = "/api";

function UploadResumePage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [jobRoleId, setJobRoleId] = useState("");
  const [file, setFile] = useState(null);
  const [anonymousMode, setAnonymousMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [parsedPreview, setParsedPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("openats_token");
    if (!token) {
      navigate("/login");
      return;
    }
    async function loadJobs() {
      const res = await fetch(`${API_BASE}/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setJobs(data);
        if (data.length > 0) {
          setJobRoleId(data[0]._id);
        }
      }
    }
    loadJobs();
  }, [navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setParsedPreview(null);
    setResult(null);
    if (!jobRoleId || !file) {
      setError("Select a job and upload a PDF resume.");
      return;
    }
    const token = localStorage.getItem("openats_token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("jobRoleId", jobRoleId);
      formData.append("anonymousMode", anonymousMode ? "true" : "false");
      formData.append("resume", file);

      const tl = gsap.timeline();
      tl.to(".scan-bar", {
        width: "100%",
        duration: 1.2,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
      });

      const res = await fetch(`${API_BASE}/applications/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      tl.kill();
      gsap.set(".scan-bar", { width: "0%" });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Upload failed");
      }
      setParsedPreview(data.parsedPreview);
      setResult({
        overallScore: data.overallScore,
        dimensionScores: data.dimensionScores,
        explanation: data.explanation,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold tracking-tight">Upload Resume</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:border-indigo-400 hover:text-indigo-300"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {jobs.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">
                Available jobs
              </h2>
              <p className="text-xs text-slate-400">
                Select a job and upload your resume to apply.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {jobs.map((job) => (
                <button
                  key={job._id}
                  type="button"
                  onClick={() => {
                    setJobRoleId(job._id);
                    const formEl = document.getElementById("upload-resume-form");
                    if (formEl) {
                      formEl.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className={`flex flex-col items-start rounded-xl border px-3 py-3 text-left text-xs transition ${
                    jobRoleId === job._id
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-slate-800 bg-slate-950/40 hover:border-indigo-400 hover:bg-slate-900"
                  }`}
                >
                  <span className="mb-1 text-sm font-semibold text-slate-100">
                    {job.title}
                  </span>
                  {job.requiredSkills?.length ? (
                    <p className="text-[11px] text-slate-400">
                      Skills:{" "}
                      <span className="text-slate-200">
                        {job.requiredSkills.join(", ")}
                      </span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      No specific skills listed.
                    </p>
                  )}
                  <span className="mt-2 inline-flex items-center rounded-full bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-100">
                    {jobRoleId === job._id ? "Selected" : "Apply for this job"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <form
          id="upload-resume-form"
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">
                Job Role
              </label>
              <select
                value={jobRoleId}
                onChange={(e) => setJobRoleId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              >
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-between gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={anonymousMode}
                  onChange={(e) => setAnonymousMode(e.target.checked)}
                  className="h-3 w-3 rounded border-slate-600 bg-slate-900 text-indigo-500"
                />
                Anonymous mode (hide name/college during scoring)
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Upload PDF Resume
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-medium file:text-slate-100 hover:file:bg-slate-700"
              />
              {file && (
                <span className="truncate text-xs text-slate-400">{file.name}</span>
              )}
            </div>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-800">
            <div className="scan-bar h-1.5 w-0 rounded-full bg-indigo-500" />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-500 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-700/70"
          >
            {loading ? "Analyzing resume..." : "Submit"}
          </button>
        </form>

        {parsedPreview && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Auto-parse preview
            </h2>
            <p className="mb-1 text-xs text-slate-400">Skills</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {parsedPreview.skills?.length ? (
                parsedPreview.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-100"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">No skills detected.</span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Experience:{" "}
              <span className="font-medium text-slate-200">
                {parsedPreview.yearsExperience ?? 0} years
              </span>
            </p>
          </section>
        )}

        {result && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-slate-100">
              Explainable score
            </h2>
            <p className="text-lg font-semibold text-indigo-400">
              Final score: {result.overallScore}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {Object.entries(result.dimensionScores).map(([key, dim]) => (
                <div key={key} className="rounded-xl bg-slate-900/80 p-3 text-xs">
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
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-300">
              {result.explanation.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

export default UploadResumePage;


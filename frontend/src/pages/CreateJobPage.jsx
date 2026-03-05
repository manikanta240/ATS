import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api";

function CreateJobPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [weights, setWeights] = useState({
    skills: 40,
    experience: 30,
    education: 15,
    projects: 15,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("openats_token");
    if (!token) {
      navigate("/login");
      return; // 🔥 VERY IMPORTANT
    }
  }, [navigate]);

  function handleAddSkill(e) {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  }

  function handleRemoveSkill(skill) {
    setSkills(skills.filter((s) => s !== skill));
  }

  function handleSliderChange(key, value) {
    setWeights((prev) => ({ ...prev, [key]: Number(value) }));
  }

  const totalWeight =
    weights.skills + weights.experience + weights.education + weights.projects;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (totalWeight !== 100) {
      setError("Weights must sum to 100%.");
      return;
    }
    const token = localStorage.getItem("openats_token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          requiredSkills: skills,
          weights,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to create job");
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold tracking-tight">Create Job</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:border-indigo-400 hover:text-indigo-300"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Job Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-200">
              Required Skills
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                placeholder="e.g. React, Node.js"
              />
              <button
                onClick={handleAddSkill}
                className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-100"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-200">
                Weight sliders
              </label>
              <span className="text-xs text-slate-400">
                Total:{" "}
                <span
                  className={
                    totalWeight === 100 ? "text-emerald-400" : "text-red-400"
                  }
                >
                  {totalWeight}%
                </span>
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["skills", "experience", "education", "projects"].map((key) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                    <span className="capitalize">{key} %</span>
                    <span>{weights[key]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights[key]}
                    onChange={(e) => handleSliderChange(key, e.target.value)}
                    className="h-1 w-full cursor-pointer rounded-lg bg-slate-800 accent-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-500 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            Create Job
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateJobPage;

import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CreateJobPage from "./pages/CreateJobPage.jsx";
import UploadResumePage from "./pages/UploadResumePage.jsx";
import CandidateRankingPage from "./pages/CandidateRankingPage.jsx";

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs/new" element={<CreateJobPage />} />
        <Route path="/upload" element={<UploadResumePage />} />
        <Route path="/jobs/:jobId/ranking" element={<CandidateRankingPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;

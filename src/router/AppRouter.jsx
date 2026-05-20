import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import HomePage from "../pages/HomePage";
import RecruitPage from "../pages/RecruitPage";
import AboutPage from "../pages/AboutPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import ProjectApplicationPage from "../pages/ProjectApplicationPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recruit" element={<RecruitPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route
            path="/projects/:projectId/apply"
            element={<ProjectApplicationPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

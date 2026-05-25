import { BrowserRouter, Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";

import HomePage from "../pages/HomePage";
import RecruitPage from "../pages/RecruitPage";
import AboutPage from "../pages/AboutPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import ProjectApplicationPage from "../pages/ProjectApplicationPage";
import NotFoundPage from "../pages/NotFoundPage";

import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminRequestsPage from "../pages/admin/AdminRequestsPage";
import AdminProjectsPage from "../pages/admin/AdminProjectsPage";
import AdminContentsPage from "../pages/admin/AdminContentsPage";
import AdminSmsPage from "../pages/admin/AdminSmsPage";
import AdminSurveyPage from "../pages/admin/AdminSurveyPage";
import AdminNotFoundPage from "../pages/admin/AdminNotFoundPage";

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

        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="requests" element={<AdminRequestsPage />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="contents" element={<AdminContentsPage />} />
          <Route path="sms" element={<AdminSmsPage />} />
          <Route path="survey" element={<AdminSurveyPage />} />
          <Route path="*" element={<AdminNotFoundPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

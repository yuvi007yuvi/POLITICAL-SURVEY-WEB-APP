import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { DashboardLayout } from "./layouts/DashboardLayout.jsx";

const LoginPage = lazy(() => import("./pages/LoginPage.jsx").then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage.jsx").then((module) => ({ default: module.DashboardPage }))
);
const ProjectsPage = lazy(() =>
  import("./pages/ProjectsPage.jsx").then((module) => ({ default: module.ProjectsPage }))
);
const AdminHubPage = lazy(() => import("./pages/AdminHubPage.jsx").then((module) => ({ default: module.AdminHubPage })));
const ProjectAdminPage = lazy(() => import("./pages/ProjectAdminPage.jsx").then((module) => ({ default: module.ProjectAdminPage })));
const ReportsPage = lazy(() => import("./pages/ReportsPage.jsx").then((module) => ({ default: module.ReportsPage })));
const KpiReportsPage = lazy(() => import("./pages/KpiReportsPage.jsx").then((module) => ({ default: module.KpiReportsPage })));
const MapTrackingPage = lazy(() => import("./pages/MapTrackingPage.jsx").then((module) => ({ default: module.MapTrackingPage })));
const SurveySubmissionPage = lazy(() => import("./pages/SurveySubmissionPage.jsx").then((module) => ({ default: module.SurveySubmissionPage })));
const AttendancePage = lazy(() => import("./pages/AttendancePage.jsx").then((module) => ({ default: module.AttendancePage })));
const AttendanceHistoryPage = lazy(() => import("./pages/AttendanceHistoryPage.jsx").then((module) => ({ default: module.AttendanceHistoryPage })));
const FaceEnrollmentPage = lazy(() => import("./pages/FaceEnrollmentPage.jsx").then((module) => ({ default: module.FaceEnrollmentPage })));

import { LoadingScreen } from "./components/LoadingScreen.jsx";
import { Toaster } from "react-hot-toast";

const App = () => (
  <>
    <Toaster position="top-right" reverseOrder={false} />
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route 
            index 
            element={
              <ProtectedRoute permission="view_dashboard">
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="projects" 
            element={
              <ProtectedRoute permission="manage_projects">
                <ProjectsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="projects/:id/admin" 
            element={
              <ProtectedRoute permission="manage_projects">
                <ProjectAdminPage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="admin/*"
            element={
              <ProtectedRoute permission="manage_roles">
                <AdminHubPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="reports" 
            element={
              <ProtectedRoute permission={["view_all_reports", "view_assigned_reports"]}>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="kpi-reports" 
            element={
              <ProtectedRoute permission="view_all_reports">
                <KpiReportsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="tracking" 
            element={
              <ProtectedRoute permission={["view_all_reports", "view_assigned_reports"]}>
                <MapTrackingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="survey-form" 
            element={
              <ProtectedRoute permission="submit_surveys">
                <SurveySubmissionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="survey-form/:projectId" 
            element={
              <ProtectedRoute permission="submit_surveys">
                <SurveySubmissionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="attendance" 
            element={
              <ProtectedRoute permission="view_dashboard">
                <AttendancePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="attendance/logs" 
            element={
              <ProtectedRoute permission="view_dashboard">
                <AttendanceHistoryPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="attendance/setup" 
            element={
              <ProtectedRoute permission="view_dashboard">
                <FaceEnrollmentPage />
              </ProtectedRoute>
            } 
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </>
);

export default App;

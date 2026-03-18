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
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id/admin" element={<ProjectAdminPage />} />
          <Route
            path="admin/*"
            element={
              <ProtectedRoute permission="manage_roles">
                <AdminHubPage />
              </ProtectedRoute>
            }
          />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="kpi-reports" element={<KpiReportsPage />} />
          <Route path="tracking" element={<MapTrackingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </>
);

export default App;

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
const UsersPage = lazy(() => import("./pages/UsersPage.jsx").then((module) => ({ default: module.UsersPage })));
const RolesPage = lazy(() => import("./pages/RolesPage.jsx").then((module) => ({ default: module.RolesPage })));
const ReportsPage = lazy(() =>
  import("./pages/ReportsPage.jsx").then((module) => ({ default: module.ReportsPage }))
);
const MapTrackingPage = lazy(() =>
  import("./pages/MapTrackingPage.jsx").then((module) => ({ default: module.MapTrackingPage }))
);

const PageLoader = () => <div className="p-6 text-center text-slate-500">Loading...</div>;

const App = () => (
  <Suspense fallback={<PageLoader />}>
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
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="tracking" element={<MapTrackingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default App;

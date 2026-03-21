import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export const ProtectedRoute = ({ children, permission, role }) => {
  const { isAuthenticated, session } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const userRoleKey = session?.user?.role?.key;
  const userPermissions = session?.user?.role?.permissions || [];

  // Super Admin Always Bypass
  if (userRoleKey === "super_admin") return children;

  // Specific Role Check
  if (role && userRoleKey !== role) return <Navigate to="/" replace />;

  // Specific Permission Check
  if (permission) {
    const required = Array.isArray(permission) ? permission : [permission];
    const hasPermission = required.some(p => userPermissions.includes(p));
    if (!hasPermission) return <Navigate to="/" replace />;
  }

  return children;
};


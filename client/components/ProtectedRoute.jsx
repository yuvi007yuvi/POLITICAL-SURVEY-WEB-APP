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
  if (permission && !userPermissions.includes(permission)) return <Navigate to="/" replace />;

  return children;
};


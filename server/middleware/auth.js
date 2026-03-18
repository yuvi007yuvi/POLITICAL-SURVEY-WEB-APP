import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization token missing");
  }

  const token = header.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Populate role to access permissions
  const user = await User.findById(decoded.userId)
    .select("-password")
    .populate("role");

  if (!user || !user.isActive) {
    throw new ApiError(401, "User is not authorized");
  }

  req.user = user;
  next();
});

// Check by Role Key (legacy support / high level checks)
export const authorize = (...roleKeys) => (req, res, next) => {
  if (!req.user.role || !roleKeys.includes(req.user.role.key)) {
    next(new ApiError(403, "You do not have access to this resource"));
    return;
  }

  next();
};

// Check by Specific Permission
export const hasPermission = (permission) => (req, res, next) => {
  if (!req.user.role || !req.user.role.permissions.includes(permission)) {
    next(new ApiError(403, `Missing required permission: ${permission}`));
    return;
  }

  next();
};

// Check if user has access to a specific project
export const authorizeProjectAccess = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.body.projectId || req.query.projectId;

  // Roles with view_all_reports or manage_projects can access all projects
  if (
    req.user.role.permissions.includes("view_all_reports") ||
    req.user.role.permissions.includes("manage_projects") ||
    req.user.role.key === "super_admin"
  ) {
    next();
    return;
  }

  // Others can only access assigned projects
  if (!projectId) {
    next();
    return;
  }

  const hasAccess = req.user.assignedProjects.some(
    (p) => p.toString() === projectId.toString()
  );

  if (!hasAccess) {
    throw new ApiError(403, "You do not have access to this project");
  }

  next();
});

// Helper: get project filter for the current user
export const getProjectFilter = (user) => {
  if (
    user.role.permissions.includes("view_all_reports") ||
    user.role.permissions.includes("manage_projects") ||
    user.role.key === "super_admin"
  ) {
    return {};
  }

  return { _id: { $in: user.assignedProjects } };
};

// Helper: get survey filter for the current user
export const getSurveyFilter = (user) => {
  if (
    user.role.permissions.includes("view_all_reports") ||
    user.role.key === "super_admin"
  ) {
    return {};
  }

  return { projectId: { $in: user.assignedProjects } };
};

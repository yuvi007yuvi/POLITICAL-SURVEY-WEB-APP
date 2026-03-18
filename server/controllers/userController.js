import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildPagination } from "../utils/pagination.js";

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);

  // regional_admin can only see surveyors assigned to their projects
  let filter = {};
  if (req.user.role.key === "regional_admin") {
    filter = {
      $or: [
        { assignedProjects: { $in: req.user.assignedProjects } },
        { _id: req.user._id }
      ]
    };
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .populate("assignedProjects", "name code")
      .populate("role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }
  });
});

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, assignedProjects } = req.body;

  // role should be an ObjectId now from the frontend
  if (!role) {
    throw new ApiError(400, "Role is required");
  }

  // Permission check: only those with manage_users can create users
  // (Route already handles this but controller adds extra safety)

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role, // ObjectId
    phone: phone || "",
    assignedProjects: assignedProjects || [],
    isActive: true
  });

  const populated = await User.findById(user._id)
    .select("-password")
    .populate("assignedProjects", "name code")
    .populate("role");

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: populated
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role, phone, assignedProjects, isActive } = req.body;

  const user = await User.findById(id).populate("role");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Protect super_admin from being modified by non-super_admin
  if (user.role.key === "super_admin" && req.user.role.key !== "super_admin") {
    throw new ApiError(403, "Cannot modify Super Admin account");
  }

  if (name !== undefined) user.name = name;
  if (role !== undefined) user.role = role; // ObjectId
  if (phone !== undefined) user.phone = phone;
  if (assignedProjects !== undefined) user.assignedProjects = assignedProjects;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  const populated = await User.findById(user._id)
    .select("-password")
    .populate("assignedProjects", "name code")
    .populate("role");

  res.json({
    success: true,
    message: "User updated successfully",
    data: populated
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).populate("role");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role.key === "super_admin") {
    throw new ApiError(403, "Cannot deactivate Super Admin");
  }

  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: "User deactivated successfully"
  });
});

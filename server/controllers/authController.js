import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/token.js";

const buildAuthPayload = (user) => ({
  token: generateToken({ userId: user._id, role: user.role }),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    assignedProjects: user.assignedProjects
  }
});

export const register = asyncHandler(async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: buildAuthPayload(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User account is inactive");
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    success: true,
    message: "Login successful",
    data: buildAuthPayload(user)
  });
});

export const profile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});


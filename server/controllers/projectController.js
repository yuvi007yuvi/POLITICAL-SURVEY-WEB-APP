import { Project } from "../models/Project.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    createdBy: req.user._id
  });

  if (project.assignedUsers?.length) {
    await User.updateMany(
      { _id: { $in: project.assignedUsers } },
      {
        $addToSet: {
          assignedProjects: project._id
        }
      }
    );
  }

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project
  });
});

export const getProjects = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === "admin"
      ? {}
      : {
          _id: { $in: req.user.assignedProjects }
        };

  const projects = await Project.find(filter)
    .populate("assignedUsers", "name email role")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: projects
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId).populate(
    "assignedUsers",
    "name email"
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  res.json({
    success: true,
    data: project
  });
});


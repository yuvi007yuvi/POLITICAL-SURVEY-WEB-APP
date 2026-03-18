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
    ["super_admin", "admin"].includes(req.user.role?.key)
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

export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const oldAssignedUsers = project.assignedUsers.map((id) => id.toString());
  const newAssignedUsers = (req.body.assignedUsers || []).map((id) => id.toString());

  // Update project
  Object.assign(project, req.body);
  await project.save();

  // Sync users
  const addedUsers = newAssignedUsers.filter((id) => !oldAssignedUsers.includes(id));
  const removedUsers = oldAssignedUsers.filter((id) => !newAssignedUsers.includes(id));

  if (addedUsers.length) {
    await User.updateMany(
      { _id: { $in: addedUsers } },
      { $addToSet: { assignedProjects: projectId } }
    );
  }

  if (removedUsers.length) {
    await User.updateMany(
      { _id: { $in: removedUsers } },
      { $pull: { assignedProjects: projectId } }
    );
  }

  res.json({
    success: true,
    message: "Project updated successfully",
    data: project
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Cleanup user references
  await User.updateMany(
    { assignedProjects: projectId },
    { $pull: { assignedProjects: projectId } }
  );

  res.json({
    success: true,
    message: "Project deleted successfully"
  });
});


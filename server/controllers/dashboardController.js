import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Survey } from "../models/Survey.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getProjectFilter, getSurveyFilter } from "../middleware/auth.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const projectFilter = getProjectFilter(req.user);
  const surveyFilter = getSurveyFilter(req.user);

  const [totalUsers, totalProjects, totalSurveys, activeProjects, recentSurveys] =
    await Promise.all([
      User.countDocuments({ isActive: true }),
      Project.countDocuments(projectFilter),
      Survey.countDocuments(surveyFilter),
      Project.countDocuments({ ...projectFilter, status: "active" }),
      Survey.find(surveyFilter)
        .populate("userId", "name")
        .populate("projectId", "name")
        .sort({ submittedAt: -1 })
        .limit(10)
    ]);

  // Build aggregation match stage for project scoping
  const matchStage = {};
  if (surveyFilter.projectId) {
    matchStage.projectId = { $in: surveyFilter.projectId.$in.map(id => new mongoose.Types.ObjectId(id)) };
  }

  const surveysPerProject = await Survey.aggregate([
    ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
    {
      $group: {
        _id: "$projectId",
        submissions: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "_id",
        as: "project"
      }
    },
    { $unwind: "$project" },
    {
      $project: {
        _id: 0,
        projectId: "$project._id",
        projectName: "$project.name",
        submissions: 1
      }
    },
    { $sort: { submissions: -1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalProjects,
      totalSurveys,
      activeProjects,
      recentSurveys,
      surveysPerProject
    }
  });
});

import mongoose from "mongoose";
import { Project } from "../models/Project.js";
import { Survey } from "../models/Survey.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getProjectFilter, getSurveyFilter } from "../middleware/auth.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const { projectId } = req.query;
  const projectFilter = getProjectFilter(req.user);
  const surveyFilter = getSurveyFilter(req.user);

  if (projectId) {
    surveyFilter.projectId = new mongoose.Types.ObjectId(projectId);
    projectFilter._id = new mongoose.Types.ObjectId(projectId);
  }

  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [countStats, recentSurveys, surveysPerProject, categoricalInsights] = await Promise.all([
    // 1. Core Count Stats & Time-based Counts
    Survey.aggregate([
      { $match: surveyFilter },
      {
        $facet: {
          total: [{ $count: "count" }],
          today: [{ $match: { submittedAt: { $gte: startOfDay } } }, { $count: "count" }],
          thisMonth: [{ $match: { submittedAt: { $gte: startOfMonth } } }, { $count: "count" }],
          prevMonth: [
            { $match: { submittedAt: { $gte: startOfPrevMonth, $lt: startOfMonth } } },
            { $count: "count" }
          ],
          thisYear: [{ $match: { submittedAt: { $gte: startOfYear } } }, { $count: "count" }]
        }
      }
    ]),

    // 2. Recent Activity Feed
    Survey.find(surveyFilter)
      .populate("userId", "name")
      .populate("projectId", "name")
      .sort({ submittedAt: -1 })
      .limit(10),

    // 3. Project Velocity
    Survey.aggregate([
      { $match: surveyFilter },
      { $group: { _id: "$projectId", submissions: { $sum: 1 } } },
      { $lookup: { from: "projects", localField: "_id", foreignField: "_id", as: "project" } },
      { $unwind: "$project" },
      { $project: { _id: 0, projectId: "$project._id", projectName: "$project.name", submissions: 1 } },
      { $sort: { submissions: -1 } }
    ]),

    // 4. Distribution Analysis (Mocking categories from answers for visualization)
    Survey.aggregate([
      { $match: surveyFilter },
      { $unwind: "$answers" },
      {
        $group: {
          _id: { label: "$answers.label", value: "$answers.value" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ])
  ]);

  const [totalUsers, totalProjects, activeProjects] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Project.countDocuments(projectFilter),
    Project.countDocuments({ ...projectFilter, status: "active" })
  ]);

  // Process facets into a cleaner object
  const stats = countStats[0];
  const collectionStats = {
    total: stats.total[0]?.count || 0,
    today: stats.today[0]?.count || 0,
    thisMonth: stats.thisMonth[0]?.count || 0,
    prevMonth: stats.prevMonth[0]?.count || 0,
    thisYear: stats.thisYear[0]?.count || 0
  };

  // Mocking detailed insights for the visuals (in a real app, this would be based on specific survey fields)
  const insights = {
    sentiment: [
      { name: "Positive", value: 42, color: "#10B981" },
      { name: "Neutral", value: 35, color: "#FBBF24" },
      { name: "Negative", value: 23, color: "#EF4444" }
    ],
    quality: [
      { name: "Verified", value: 65, color: "#3B82F6" },
      { name: "Flagged", value: 15, color: "#F87171" },
      { name: "Pending", value: 20, color: "#94A3B8" }
    ]
  };

  res.json({
    success: true,
    data: {
      totalUsers,
      totalProjects,
      totalSurveys: collectionStats.total,
      activeProjects,
      recentSurveys,
      surveysPerProject,
      collectionStats,
      insights
    }
  });
});

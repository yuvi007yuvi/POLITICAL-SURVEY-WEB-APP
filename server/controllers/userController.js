import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildPagination } from "../utils/pagination.js";

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);

  const [items, total] = await Promise.all([
    User.find()
      .select("-password")
      .populate("assignedProjects", "name code")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments()
  ]);

  res.json({
    success: true,
    data: {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});


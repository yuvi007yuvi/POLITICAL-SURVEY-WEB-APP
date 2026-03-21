import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import { Project } from "../models/Project.js";
import { Survey } from "../models/Survey.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildPagination } from "../utils/pagination.js";
import { getSurveyFilter } from "../middleware/auth.js";

const uploadSurveyMedia = async (files) => {
  const photoUploads = files.photos || [];
  const voiceUploads = files.voice || [];

  const photos = await Promise.all(
    photoUploads.map(async (photo) => {
      const uploaded = await uploadBufferToCloudinary({
        buffer: photo.buffer,
        folder: "political-soch/photos"
      });

      return {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        uploadedAt: new Date()
      };
    })
  );

  let voiceRecording = null;
  if (voiceUploads[0]) {
    const uploaded = await uploadBufferToCloudinary({
      buffer: voiceUploads[0].buffer,
      folder: "political-soch/voice",
      resourceType: "video"
    });

    voiceRecording = {
      url: uploaded.secure_url,
      publicId: uploaded.public_id
    };
  }

  return { photos, voiceRecording };
};

export const submitSurvey = asyncHandler(async (req, res) => {
  const answers =
    typeof req.body.answers === "string" ? JSON.parse(req.body.answers) : req.body.answers;
  const gpsLocation =
    typeof req.body.gpsLocation === "string"
      ? JSON.parse(req.body.gpsLocation)
      : req.body.gpsLocation;

  const project = await Project.findById(req.body.projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (
    !["super_admin", "admin"].includes(req.user.role?.key) &&
    !req.user.assignedProjects.some(
      (assignedProjectId) => assignedProjectId.toString() === req.body.projectId
    )
  ) {
    throw new ApiError(403, "Project not assigned to user");
  }

  const { photos, voiceRecording } = await uploadSurveyMedia(req.files || {});

  const survey = await Survey.create({
    userId: req.user._id,
    projectId: req.body.projectId,
    answers,
    gpsLocation,
    photos,
    voiceRecording,
    offlineReferenceId: req.body.offlineReferenceId
  });

  res.status(201).json({
    success: true,
    message: "Survey submitted successfully",
    data: survey
  });
});

export const getSurveyReports = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = { ...getSurveyFilter(req.user) };

  if (req.query.projectId) {
    filter.projectId = req.query.projectId;
  }

  if (req.query.userId) {
    filter.userId = req.query.userId;
  }

  if (req.query.date) {
    const startOfDay = new Date(req.query.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(req.query.date);
    endOfDay.setHours(23, 59, 59, 999);

    filter.submittedAt = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }

  const [items, total] = await Promise.all([
    Survey.find(filter)
      .populate("userId", "name email")
      .populate("projectId", "name code")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit),
    Survey.countDocuments(filter)
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


import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = "uploads/profiles";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Only image files are allowed"), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload profile photo
router.post("/profile-photo/:userId", protect, upload.single("photo"), asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!req.file) {
        throw new ApiError(400, "Please upload a photo");
    }

    const photoPath = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.profilePhoto = photoPath;
    await user.save();

    res.json({
        success: true,
        message: "Profile photo uploaded successfully",
        data: {
            profilePhoto: photoPath
        }
    });
}));

export default router;

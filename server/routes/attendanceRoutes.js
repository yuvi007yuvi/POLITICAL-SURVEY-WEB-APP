import express from "express";
import { protect } from "../middleware/auth.js";
import { 
  registerFace, 
  markAttendance, 
  getAttendanceHistory,
  getAttendanceStats,
  getAttendanceCalendar,
  getTodayStatus
} from "../controllers/attendanceController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

router.get("/stats", getAttendanceStats);
router.get("/calendar", getAttendanceCalendar);
router.get("/today-status", getTodayStatus);
router.post("/register-face", registerFace);
router.post(
  "/mark-attendance", 
  upload.fields([{ name: "photo", maxCount: 1 }]), 
  markAttendance
);
router.get("/history", getAttendanceHistory);

export default router;

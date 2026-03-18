import express from "express";
import { authorize, protect } from "../middleware/auth.js";
import {
  getSurveyReports,
  submitSurvey
} from "../controllers/surveyController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.use(protect);

router.post(
  "/submitSurvey",
  upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "voice", maxCount: 1 }
  ]),
  submitSurvey
);

router.get("/surveyReports", authorize("super_admin", "admin", "regional_admin"), getSurveyReports);

export default router;

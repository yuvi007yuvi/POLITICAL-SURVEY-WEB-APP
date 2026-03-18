import express from "express";
import { login, register } from "../controllers/authController.js";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { createProject, getProjects } from "../controllers/projectController.js";
import { getSurveyReports, submitSurvey } from "../controllers/surveyController.js";
import { getUsers } from "../controllers/userController.js";
import { authorize, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { authSchema, projectSchema, registerSchema } from "../utils/validationSchemas.js";

const router = express.Router();

router.post("/login", validate(authSchema), login);
router.post("/register", validate(registerSchema), register);
router.post("/createProject", protect, authorize("admin"), validate(projectSchema), createProject);
router.get("/projects", protect, getProjects);
router.post(
  "/submitSurvey",
  protect,
  upload.fields([
    { name: "photos", maxCount: 5 },
    { name: "voice", maxCount: 1 }
  ]),
  submitSurvey
);
router.get("/surveyReports", protect, authorize("admin"), getSurveyReports);
router.get("/users", protect, authorize("admin"), getUsers);
router.get("/dashboardStats", protect, authorize("admin"), getDashboardStats);

export default router;


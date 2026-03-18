import express from "express";
import {
  createProject,
  getProjectById,
  getProjects
} from "../controllers/projectController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { projectSchema } from "../utils/validationSchemas.js";

const router = express.Router();

router.use(protect);
router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.post("/", authorize("admin"), validate(projectSchema), createProject);

export default router;


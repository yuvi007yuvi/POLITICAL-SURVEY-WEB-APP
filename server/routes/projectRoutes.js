import express from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject
} from "../controllers/projectController.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { projectSchema } from "../utils/validationSchemas.js";

const router = express.Router();

router.use(protect);
router.get("/", getProjects);
router.get("/:projectId", getProjectById);
router.post("/", authorize("super_admin", "admin"), validate(projectSchema), createProject);
router.put("/:projectId", authorize("super_admin", "admin"), validate(projectSchema), updateProject);
router.delete("/:projectId", authorize("super_admin", "admin"), deleteProject);

export default router;


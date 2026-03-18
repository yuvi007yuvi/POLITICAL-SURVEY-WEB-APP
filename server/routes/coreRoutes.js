import express from "express";
import { login, register } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { authSchema, registerSchema } from "../utils/validationSchemas.js";

const router = express.Router();

// Public auth routes (also handled by /api/auth but kept here for compatibility if needed)
router.post("/login", validate(authSchema), login);
router.post("/register", validate(registerSchema), register);

// Dedicated routes are handled via:
// /api/projects -> projectRoutes.js
// /api/surveys  -> surveyRoutes.js
// /api/users    -> userRoutes.js
// /api/dashboardStats -> dashboardRoutes.js

export default router;

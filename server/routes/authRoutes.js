import express from "express";
import { login, profile, register } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authSchema, registerSchema } from "../utils/validationSchemas.js";

const router = express.Router();

router.post("/login", validate(authSchema), login);
router.post("/register", validate(registerSchema), register);
router.get("/profile", protect, profile);

export default router;


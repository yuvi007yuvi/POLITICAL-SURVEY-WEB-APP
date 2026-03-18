import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/", getDashboardStats);

export default router;


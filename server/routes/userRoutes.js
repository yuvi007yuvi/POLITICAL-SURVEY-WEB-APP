import express from "express";
import { getUsers } from "../controllers/userController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/", getUsers);

export default router;


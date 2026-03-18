import express from "express";
import { createUser, deleteUser, getUsers, updateUser } from "../controllers/userController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, authorize("super_admin", "admin", "regional_admin"));

router.get("/", getUsers);
router.post("/", authorize("super_admin", "admin"), createUser);
router.put("/:id", authorize("super_admin", "admin"), updateUser);
router.delete("/:id", authorize("super_admin", "admin"), deleteUser);

export default router;

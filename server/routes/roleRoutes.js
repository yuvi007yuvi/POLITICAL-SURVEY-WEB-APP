import express from "express";
import { createRole, deleteRole, getRoles, updateRole } from "../controllers/roleController.js";
import { hasPermission, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getRoles);

// Only roles with manage_roles permission can create/edit/delete roles
router.post("/", hasPermission("manage_roles"), createRole);
router.put("/:id", hasPermission("manage_roles"), updateRole);
router.delete("/:id", hasPermission("manage_roles"), deleteRole);

export default router;

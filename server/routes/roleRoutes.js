import express from "express";
import { createRole, deleteRole, getRoleById, getRoles, updateRole } from "../controllers/roleController.js";
import { hasPermission, protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getRoles);
router.get("/:id", hasPermission("manage_roles"), getRoleById);

// Only roles with manage_roles permission can create/edit/delete roles
router.post("/", hasPermission("manage_roles"), createRole);
router.put("/:id", hasPermission("manage_roles"), updateRole);
router.delete("/:id", hasPermission("manage_roles"), deleteRole);

export default router;

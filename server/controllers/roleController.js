import { Role } from "../models/Role.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getRoles = asyncHandler(async (req, res) => {
    const roles = await Role.find().sort({ createdAt: 1 });
    res.json({
        success: true,
        data: roles
    });
});

export const getRoleById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
        throw new ApiError(404, "Role not found");
    }
    res.json({
        success: true,
        data: role
    });
});

export const createRole = asyncHandler(async (req, res) => {
    const { name, description, permissions } = req.body;

    const key = name.toLowerCase().replace(/\s+/g, "_");

    const existing = await Role.findOne({ $or: [{ name }, { key }] });
    if (existing) {
        throw new ApiError(409, "Role with this name or key already exists");
    }

    const role = await Role.create({
        name,
        key,
        description,
        permissions: permissions || [],
        isSystemRole: false
    });

    res.status(201).json({
        success: true,
        message: "Role created successfully",
        data: role
    });
});

export const updateRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role) {
        throw new ApiError(404, "Role not found");
    }

    if (role.isSystemRole && (name || permissions)) {
        // allow description update only for system roles if needed, 
        // but usually system roles are protected
        throw new ApiError(403, "System roles cannot be modified");
    }

    if (name) {
        role.name = name;
        role.key = name.toLowerCase().replace(/\s+/g, "_");
    }
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = permissions;

    await role.save();

    res.json({
        success: true,
        message: "Role updated successfully",
        data: role
    });
});

export const deleteRole = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
        throw new ApiError(404, "Role not found");
    }

    if (role.isSystemRole) {
        throw new ApiError(403, "System roles cannot be deleted");
    }

    // Check if any users are using this role
    const userCount = await User.countDocuments({ role: id });
    if (userCount > 0) {
        throw new ApiError(400, "Cannot delete role while it is assigned to users");
    }

    await Role.findByIdAndDelete(id);

    res.json({
        success: true,
        message: "Role deleted successfully"
    });
});

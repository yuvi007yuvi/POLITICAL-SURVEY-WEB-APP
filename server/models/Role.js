import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        key: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        permissions: [
            {
                type: String,
                enum: [
                    "view_dashboard",
                    "manage_projects",
                    "view_all_reports",
                    "view_assigned_reports",
                    "manage_users",
                    "manage_roles",
                    "submit_surveys"
                ]
            }
        ],
        isSystemRole: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const Role = mongoose.model("Role", roleSchema);

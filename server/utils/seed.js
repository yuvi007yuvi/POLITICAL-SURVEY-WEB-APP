import { Role } from "../models/Role.js";
import { User } from "../models/User.js";

const DEFAULT_ROLES = [
    {
        name: "Super Admin",
        key: "super_admin",
        description: "Full platform access and role management",
        permissions: ["view_dashboard", "manage_projects", "view_all_reports", "manage_users", "manage_roles"],
        isSystemRole: true
    },
    {
        name: "Admin",
        key: "admin",
        description: "Manage projects, users and view all reports",
        permissions: ["view_dashboard", "manage_projects", "view_all_reports", "manage_users"],
        isSystemRole: true
    },
    {
        name: "Regional Admin",
        key: "regional_admin",
        description: "Access to assigned projects and reports",
        permissions: ["view_dashboard", "view_assigned_reports"],
        isSystemRole: true
    },
    {
        name: "Surveyor",
        key: "surveyor",
        description: "Mobile user for field data collection",
        permissions: ["submit_surveys"],
        isSystemRole: true
    }
];

async function seedRolesAndAdmin() {
    try {
        console.log("Starting RBAC seeding and migration...");

        // 1. Seed Roles
        const roleMap = {};
        for (const roleData of DEFAULT_ROLES) {
            let role = await Role.findOne({ key: roleData.key });
            if (!role) {
                role = await Role.create(roleData);
                console.log(`Created role: ${role.name}`);
            } else {
                // Update permissions for system roles to ensure they are up to date
                role.permissions = roleData.permissions;
                await role.save();
            }
            roleMap[roleData.key] = role._id;
        }

        // 2. Migrate Users (convert String roles to ObjectIds)
        const users = await User.find({});
        let migratedCount = 0;

        for (const user of users) {
            // If role is a string (e.g. from old schema), migrate it
            if (typeof user.role === "string") {
                const roleId = roleMap[user.role] || roleMap["surveyor"];
                user.role = roleId;
                await user.save();
                migratedCount++;
            } else if (!user.role) {
                // Assign default surveyor role if missing
                user.role = roleMap["surveyor"];
                await user.save();
                migratedCount++;
            }
        }

        if (migratedCount > 0) {
            console.log(`Migrated ${migratedCount} users to new role system.`);
        }

        // 3. Ensure Super Admin exists
        const adminEmail = "admin@politicalsoch.com";
        const adminPassword = "admin-password-123";

        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            admin = await User.create({
                name: "Super Admin",
                email: adminEmail,
                password: adminPassword,
                role: roleMap["super_admin"],
                isActive: true
            });
            console.log("--------------------------------------");
            console.log("SUPER ADMIN CREATED SUCCESSFULLY");
            console.log(`Email: ${adminEmail}`);
            console.log(`Pass:  ${adminPassword}`);
            console.log("--------------------------------------");
        } else {
            // Ensure existing admin has super_admin role ObjectId
            if (admin.role.toString() !== roleMap["super_admin"].toString()) {
                admin.role = roleMap["super_admin"];
                await admin.save();
                console.log("Existing admin upgraded to super_admin role reference.");
            }
            console.log("Super Admin check: OK");
        }

        console.log("RBAC seeding and migration completed.");
    } catch (err) {
        console.error("Error during seeding/migration:", err);
    }
}

export default seedRolesAndAdmin;

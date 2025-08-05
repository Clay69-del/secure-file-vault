import { User } from "../models/index.js";
import bcrypt from "bcryptjs";
import {
  logAdminAction,
  AUDIT_ACTIONS,
  AUDIT_SEVERITY,
} from "../middleware/auditLogger.js";

/**
 * Create new admin user (Super Admin only)
 */
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role = "admin" } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    if (!["admin", "super_admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Use "admin" or "super_admin"',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status: "active",
    });

    // Remove password from response
    const responseData = {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      status: adminUser.status,
      createdAt: adminUser.createdAt,
    };

    res.status(201).json({
      success: true,
      message: `${role} user created successfully`,
      data: responseData,
    });

    // Log this critical action
    await logAdminAction(
      req,
      AUDIT_ACTIONS.USER_CREATED,
      "user",
      {},
      {
        targetId: adminUser.id.toString(),
        details: {
          newUserEmail: email,
          newUserRole: role,
          createdBy: req.user.email,
        },
        severity: AUDIT_SEVERITY.CRITICAL,
      }
    );
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create admin user",
    });
  }
};

/**
 * Promote existing user to admin
 */
export const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role = "admin" } = req.body;

    if (!["admin", "super_admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Use "admin" or "super_admin"',
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Store original role for audit
    const originalRole = user.role;

    // Update user role
    await user.update({
      role,
      status: "active", // Ensure promoted user is active
    });

    res.json({
      success: true,
      message: `User promoted to ${role} successfully`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        originalRole,
      },
    });

    // Log this critical action
    await logAdminAction(
      req,
      AUDIT_ACTIONS.USER_ROLE_CHANGED,
      "user",
      {},
      {
        targetId: userId,
        details: {
          userEmail: user.email,
          from: originalRole,
          to: role,
          promotedBy: req.user.email,
        },
        severity: AUDIT_SEVERITY.CRITICAL,
      }
    );
  } catch (error) {
    console.error("Promote to admin error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to promote user to admin",
    });
  }
};

/**
 * Demote admin to regular user
 */
export const demoteAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Prevent demoting the last super admin
    if (user.role === "super_admin") {
      const superAdminCount = await User.count({
        where: { role: "super_admin" },
      });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: "Cannot demote the last super admin",
        });
      }
    }

    // Store original role for audit
    const originalRole = user.role;

    // Update user role to regular user
    await user.update({ role: "user" });

    res.json({
      success: true,
      message: "Admin demoted to regular user successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        originalRole,
      },
    });

    // Log this critical action
    await logAdminAction(
      req,
      AUDIT_ACTIONS.USER_ROLE_CHANGED,
      "user",
      {},
      {
        targetId: userId,
        details: {
          userEmail: user.email,
          from: originalRole,
          to: "user",
          demotedBy: req.user.email,
        },
        severity: AUDIT_SEVERITY.CRITICAL,
      }
    );
  } catch (error) {
    console.error("Demote admin error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to demote admin",
    });
  }
};

/**
 * Get all admin users
 */
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: {
        role: ["admin", "super_admin"],
      },
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "status",
        "createdAt",
        "updatedAt",
        "lastLoginAt",
      ],
      order: [
        ["role", "DESC"],
        ["createdAt", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: admins,
    });

    // Log this action
    await logAdminAction(
      req,
      "ADMIN_LIST_VIEWED",
      "user",
      {},
      {
        severity: AUDIT_SEVERITY.LOW,
      }
    );
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch admin users",
    });
  }
};

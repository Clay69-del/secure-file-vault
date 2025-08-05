import { User, File, AdminLog, LoginAttempt } from "../models/index.js";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import {
  logAdminAction,
  AUDIT_ACTIONS,
  AUDIT_SEVERITY,
} from "../middleware/auditLogger.js";

/**
 * Get all users with pagination and filtering
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const status = req.query.status || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "DESC";

    // Build where clause
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (status) {
      whereClause.status = status;
    }

    // Get users with file counts
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: File,
          attributes: [],
          required: false,
        },
      ],
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "status",
        "picture",
        "profilePicture",
        "createdAt",
        "updatedAt",
        "lastLoginAt",
        "loginAttempts",
        "lockedUntil",
        [
          User.sequelize.fn("COUNT", User.sequelize.col("Files.id")),
          "fileCount",
        ],
      ],
      group: ["User.id"],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      subQuery: false,
    });

    // Get total storage used by each user
    const userIds = users.map((user) => user.id);
    const storageData = await File.findAll({
      where: { userId: { [Op.in]: userIds } },
      attributes: [
        "userId",
        [File.sequelize.fn("SUM", File.sequelize.col("size")), "totalStorage"],
        [File.sequelize.fn("COUNT", File.sequelize.col("id")), "fileCount"],
      ],
      group: ["userId"],
      raw: true,
    });

    // Create storage lookup
    const storageMap = {};
    storageData.forEach((item) => {
      storageMap[item.userId] = {
        totalStorage: parseInt(item.totalStorage) || 0,
        fileCount: parseInt(item.fileCount) || 0,
      };
    });

    // Format users data
    const formattedUsers = users.map((user) => {
      const userData = user.toJSON();
      const storage = storageMap[user.id] || { totalStorage: 0, fileCount: 0 };

      return {
        ...userData,
        totalStorage: storage.totalStorage,
        fileCount: storage.fileCount,
        isLocked: user.lockedUntil && new Date(user.lockedUntil) > new Date(),
        profilePicture: user.profilePicture || user.picture,
      };
    });

    res.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          total: count.length || count,
          totalPages: Math.ceil((count.length || count) / limit),
          currentPage: page,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
};

/**
 * Get single user details with comprehensive information
 */
export const getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: File,
          attributes: ["id", "originalName", "type", "size", "uploaded"],
          order: [["uploaded", "DESC"]],
          limit: 10,
        },
        {
          model: LoginAttempt,
          as: "loginHistory",
          attributes: [
            "id",
            "success",
            "ipAddress",
            "createdAt",
            "failureReason",
          ],
          order: [["createdAt", "DESC"]],
          limit: 20,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get user statistics
    const [fileStats, loginStats] = await Promise.all([
      File.findAll({
        where: { userId },
        attributes: [
          [File.sequelize.fn("COUNT", File.sequelize.col("id")), "totalFiles"],
          [
            File.sequelize.fn("SUM", File.sequelize.col("size")),
            "totalStorage",
          ],
          [File.sequelize.fn("AVG", File.sequelize.col("size")), "avgFileSize"],
        ],
        raw: true,
      }),
      LoginAttempt.findAll({
        where: { userId },
        attributes: [
          [
            LoginAttempt.sequelize.fn(
              "COUNT",
              LoginAttempt.sequelize.col("id")
            ),
            "totalAttempts",
          ],
          [
            LoginAttempt.sequelize.literal(
              "SUM(CASE WHEN success = true THEN 1 ELSE 0 END)"
            ),
            "successfulLogins",
          ],
          [
            LoginAttempt.sequelize.literal(
              "SUM(CASE WHEN success = false THEN 1 ELSE 0 END)"
            ),
            "failedLogins",
          ],
        ],
        raw: true,
      }),
    ]);

    const userData = user.toJSON();
    const stats = fileStats[0] || {};
    const loginData = loginStats[0] || {};

    res.json({
      success: true,
      data: {
        ...userData,
        statistics: {
          totalFiles: parseInt(stats.totalFiles) || 0,
          totalStorage: parseInt(stats.totalStorage) || 0,
          avgFileSize: parseInt(stats.avgFileSize) || 0,
          totalLoginAttempts: parseInt(loginData.totalAttempts) || 0,
          successfulLogins: parseInt(loginData.successfulLogins) || 0,
          failedLogins: parseInt(loginData.failedLogins) || 0,
        },
        isLocked:
          userData.lockedUntil && new Date(userData.lockedUntil) > new Date(),
      },
    });

    // Log the action
    await logAdminAction(
      req,
      "USER_DETAILS_VIEWED",
      "user",
      {},
      {
        targetId: userId,
        severity: AUDIT_SEVERITY.LOW,
      }
    );
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user details",
    });
  }
};

/**
 * Update user information
 */
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role, status } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Store original values for audit
    const originalData = {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    // Update user
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined && req.user.role === "super_admin") {
      updateData.role = role;
    }
    if (status !== undefined) updateData.status = status;

    await user.update(updateData);

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });

    // Log the action with details of what changed
    const changes = {};
    Object.keys(updateData).forEach((key) => {
      if (originalData[key] !== updateData[key]) {
        changes[key] = { from: originalData[key], to: updateData[key] };
      }
    });

    await logAdminAction(
      req,
      AUDIT_ACTIONS.USER_UPDATED,
      "user",
      {},
      {
        targetId: userId,
        details: { changes },
        severity:
          role !== originalData.role
            ? AUDIT_SEVERITY.HIGH
            : AUDIT_SEVERITY.MEDIUM,
      }
    );
  } catch (error) {
    console.error("Update user error:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update user",
    });
  }
};

/**
 * Suspend user account
 */
export const suspendUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.status === "suspended") {
      return res.status(400).json({
        success: false,
        error: "User is already suspended",
      });
    }

    await user.update({ status: "suspended" });

    res.json({
      success: true,
      message: "User suspended successfully",
    });

    // Log the action
    await logAdminAction(
      req,
      AUDIT_ACTIONS.USER_SUSPENDED,
      "user",
      {},
      {
        targetId: userId,
        details: { reason: reason || "No reason provided" },
        severity: AUDIT_SEVERITY.HIGH,
      }
    );
  } catch (error) {
    console.error("Suspend user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to suspend user",
    });
  }
};

/**
 * Unsuspend user account
 */
export const unsuspendUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.status !== "suspended") {
      return res.status(400).json({
        success: false,
        error: "User is not suspended",
      });
    }

    await user.update({
      status: "active",
      loginAttempts: 0,
      lockedUntil: null,
    });

    res.json({
      success: true,
      message: "User unsuspended successfully",
    });

    // Log the action
    await logAdminAction(
      req,
      AUDIT_ACTIONS.USER_UNSUSPENDED,
      "user",
      {},
      {
        targetId: userId,
        severity: AUDIT_SEVERITY.MEDIUM,
      }
    );
  } catch (error) {
    console.error("Unsuspend user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to unsuspend user",
    });
  }
};

/**
 * Delete user account (soft delete - change status to inactive)
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { hardDelete = false } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Prevent deleting admin users unless super admin
    if (user.role === "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: "Cannot delete admin user",
      });
    }

    if (hardDelete && req.user.role === "super_admin") {
      // Hard delete - remove user and all associated data
      await File.destroy({ where: { userId } });
      await LoginAttempt.destroy({ where: { userId } });
      await user.destroy();
    } else {
      // Soft delete - change status to inactive
      await user.update({ status: "inactive" });
    }

    res.json({
      success: true,
      message: hardDelete
        ? "User permanently deleted"
        : "User account deactivated",
    });

    // Log the action
    await logAdminAction(
      req,
      AUDIT_ACTIONS.USER_DELETED,
      "user",
      {},
      {
        targetId: userId,
        details: { hardDelete, userEmail: user.email },
        severity: AUDIT_SEVERITY.CRITICAL,
      }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete user",
    });
  }
};

/**
 * Reset user password (admin can set new password)
 */
export const resetUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashedPassword,
      loginAttempts: 0,
      lockedUntil: null,
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });

    // Log the action
    await logAdminAction(
      req,
      "USER_PASSWORD_RESET",
      "user",
      {},
      {
        targetId: userId,
        severity: AUDIT_SEVERITY.HIGH,
      }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset password",
    });
  }
};

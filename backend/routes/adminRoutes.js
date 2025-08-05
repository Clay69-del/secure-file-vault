import express from "express";
import adminMiddleware, {
  superAdminMiddleware,
} from "../middleware/adminMiddleware.js";
import auditLogger, {
  AUDIT_ACTIONS,
  AUDIT_SEVERITY,
} from "../middleware/auditLogger.js";

// Import controllers
import {
  getDashboardStats,
  getRecentActivity,
  getSystemHealth,
  getAllFiles,
  getFileDetails,
  deleteFile,
  getAuditLogs,
  getLoginAttempts,
  getAnalytics,
  getEnhancedAnalytics,
} from "../controllers/adminDashboardController.js";

import {
  getAllUsers,
  getUserDetails,
  updateUser,
  suspendUser,
  unsuspendUser,
  deleteUser,
  resetUserPassword,
} from "../controllers/adminUserController.js";

import {
  getAllSettings,
  updateSettings,
  getSetting,
  updateSetting,
  resetToDefaults,
} from "../controllers/adminSettingsController.js";

import {
  toggleMaintenanceMode,
  getSystemStats,
  cleanupOldData,
  createBackup,
  healthCheck,
} from "../controllers/adminMaintenanceController.js";

import {
  createAdmin,
  promoteToAdmin,
  demoteAdmin,
  getAllAdmins,
} from "../controllers/adminManagementController.js";

const router = express.Router();

// All admin routes require admin authentication
router.use(adminMiddleware);

/**
 * Dashboard Routes
 */
router.get(
  "/dashboard/stats",
  auditLogger("DASHBOARD_STATS_VIEWED", "system", {
    severity: AUDIT_SEVERITY.LOW,
  }),
  getDashboardStats
);

router.get(
  "/dashboard/activity",
  auditLogger("DASHBOARD_ACTIVITY_VIEWED", "system", {
    severity: AUDIT_SEVERITY.LOW,
  }),
  getRecentActivity
);

router.get(
  "/dashboard/health",
  auditLogger("SYSTEM_HEALTH_CHECKED", "system", {
    severity: AUDIT_SEVERITY.LOW,
  }),
  getSystemHealth
);

router.get(
  "/analytics",
  auditLogger("ANALYTICS_VIEWED", "system", {
    severity: AUDIT_SEVERITY.LOW,
  }),
  getAnalytics
);

router.get(
  "/analytics/enhanced",
  superAdminMiddleware,
  auditLogger("ENHANCED_ANALYTICS_VIEWED", "system", {
    severity: AUDIT_SEVERITY.MEDIUM,
  }),
  getEnhancedAnalytics
);

/**
 * User Management Routes
 */
// Get all users (with pagination and filtering)
router.get(
  "/users",
  auditLogger("USERS_LIST_VIEWED", "user", { severity: AUDIT_SEVERITY.LOW }),
  getAllUsers
);

// Get specific user details
router.get(
  "/users/:id",
  auditLogger("USER_DETAILS_VIEWED", "user", { severity: AUDIT_SEVERITY.LOW }),
  getUserDetails
);

// Update user information
router.put(
  "/users/:id",
  auditLogger(AUDIT_ACTIONS.USER_UPDATED, "user", {
    severity: AUDIT_SEVERITY.MEDIUM,
  }),
  updateUser
);

// Suspend user
router.put(
  "/users/:id/suspend",
  auditLogger(AUDIT_ACTIONS.USER_SUSPENDED, "user", {
    severity: AUDIT_SEVERITY.HIGH,
  }),
  suspendUser
);

// Unsuspend user
router.put(
  "/users/:id/unsuspend",
  auditLogger(AUDIT_ACTIONS.USER_UNSUSPENDED, "user", {
    severity: AUDIT_SEVERITY.MEDIUM,
  }),
  unsuspendUser
);

// Reset user password (admin only)
router.put(
  "/users/:id/reset-password",
  auditLogger("USER_PASSWORD_RESET", "user", { severity: AUDIT_SEVERITY.HIGH }),
  resetUserPassword
);

// Delete user (soft delete by default, hard delete for super admin)
router.delete(
  "/users/:id",
  auditLogger(AUDIT_ACTIONS.USER_DELETED, "user", {
    severity: AUDIT_SEVERITY.CRITICAL,
  }),
  deleteUser
);

/**
 * File Management Routes
 */
router.get("/files", getAllFiles);

router.get(
  "/files/:id",
  auditLogger("FILE_DETAILS_VIEWED", "file", {
    severity: AUDIT_SEVERITY.LOW,
  }),
  getFileDetails
);

router.get(
  "/files/:id/download",
  auditLogger("FILE_DOWNLOADED", "file", {
    severity: AUDIT_SEVERITY.MEDIUM,
  }),
  async (req, res) => {
    // This should be implemented in adminDashboardController
    try {
      const fileId = req.params.id;
      // For now, return a simple response - this should be implemented properly
      res.status(501).json({ error: "File download not yet implemented" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete(
  "/files/:id",
  auditLogger(AUDIT_ACTIONS.FILE_DELETED, "file", {
    severity: AUDIT_SEVERITY.HIGH,
  }),
  deleteFile
);

/**
 * Security & Audit Routes
 */
router.get(
  "/security/login-attempts",
  auditLogger("LOGIN_ATTEMPTS_VIEWED", "system", {
    severity: AUDIT_SEVERITY.LOW,
  }),
  getLoginAttempts
);

router.get(
  "/security/audit-logs",
  auditLogger("AUDIT_LOGS_VIEWED", "system", {
    severity: AUDIT_SEVERITY.LOW,
  }),
  getAuditLogs
);

/**
 * System Settings Routes
 */
router.get("/settings", getAllSettings);

router.put("/settings", superAdminMiddleware, updateSettings);

router.get("/settings/:key", getSetting);

router.put("/settings/:key", superAdminMiddleware, updateSetting);

router.post("/settings/reset", superAdminMiddleware, resetToDefaults);

/**
 * Super Admin Only Routes
 */
// These routes require super admin privileges
router.use("/super", superAdminMiddleware);

// Create admin user (super admin only)
router.post("/super/create-admin", createAdmin);

// Promote user to admin
router.post("/super/promote/:userId", promoteToAdmin);

// Demote admin to user
router.post("/super/demote/:userId", demoteAdmin);

// Get all admin users
router.get("/super/admins", getAllAdmins);

// System maintenance (super admin only)
router.post("/super/maintenance", toggleMaintenanceMode);

router.get("/super/system-stats", getSystemStats);

router.post("/super/cleanup", cleanupOldData);

router.post("/super/backup", createBackup);

router.get("/super/health", healthCheck);

export default router;

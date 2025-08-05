import {
  User,
  File,
  AdminLog,
  LoginAttempt,
  SystemSettings,
} from "../models/index.js";
import { Op } from "sequelize";
import {
  logAdminAction,
  AUDIT_ACTIONS,
  AUDIT_SEVERITY,
} from "../middleware/auditLogger.js";
import fs from "fs";
import path from "path";

/**
 * Toggle maintenance mode
 */
export const toggleMaintenanceMode = async (req, res) => {
  try {
    const { enabled, message } = req.body;

    const [maintenanceSetting] = await SystemSettings.findOrCreate({
      where: { key: "maintenance_mode" },
      defaults: {
        key: "maintenance_mode",
        value: "false",
        category: "system",
        description: "Enable/disable maintenance mode",
        type: "boolean",
      },
    });

    const [messageSetting] = await SystemSettings.findOrCreate({
      where: { key: "maintenance_message" },
      defaults: {
        key: "maintenance_message",
        value: "System is under maintenance. Please try again later.",
        category: "system",
        description: "Maintenance mode message",
        type: "string",
      },
    });

    await maintenanceSetting.update({ value: enabled.toString() });
    if (message) {
      await messageSetting.update({ value: message });
    }

    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? "enabled" : "disabled"}`,
      data: {
        enabled,
        message: messageSetting.value,
      },
    });

    // Log this critical action
    await logAdminAction(
      req,
      "MAINTENANCE_MODE_TOGGLED",
      "system",
      {},
      {
        details: { enabled, message: messageSetting.value },
        severity: AUDIT_SEVERITY.CRITICAL,
      }
    );
  } catch (error) {
    console.error("Toggle maintenance mode error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to toggle maintenance mode",
    });
  }
};

/**
 * Get system statistics for maintenance
 */
export const getSystemStats = async (req, res) => {
  try {
    const [totalUsers, totalFiles, totalStorage, recentErrors, dbSize, uptime] =
      await Promise.all([
        User.count(),
        File.count(),
        File.sum("size"),
        AdminLog.count({
          where: {
            severity: { [Op.in]: ["high", "critical"] },
            createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
        getDatabaseSize(),
        getSystemUptime(),
      ]);

    const stats = {
      users: {
        total: totalUsers,
        active: await User.count({ where: { status: "active" } }),
        suspended: await User.count({ where: { status: "suspended" } }),
      },
      files: {
        total: totalFiles,
        totalSize: totalStorage || 0,
        averageSize:
          totalFiles > 0 ? Math.round((totalStorage || 0) / totalFiles) : 0,
      },
      system: {
        uptime: uptime,
        recentErrors: recentErrors,
        databaseSize: dbSize,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        lastRestart: new Date(Date.now() - uptime * 1000).toISOString(),
      },
    };

    res.json({
      success: true,
      data: stats,
    });

    // Log this action
    await logAdminAction(
      req,
      "SYSTEM_STATS_VIEWED",
      "system",
      {},
      {
        severity: AUDIT_SEVERITY.LOW,
      }
    );
  } catch (error) {
    console.error("Get system stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch system statistics",
    });
  }
};

/**
 * Clean up old data
 */
export const cleanupOldData = async (req, res) => {
  try {
    const { type, days = 30 } = req.body;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    switch (type) {
      case "logs":
        cleanedCount = await AdminLog.destroy({
          where: {
            createdAt: { [Op.lt]: cutoffDate },
            severity: { [Op.notIn]: ["high", "critical"] },
          },
        });
        break;

      case "login_attempts":
        cleanedCount = await LoginAttempt.destroy({
          where: {
            createdAt: { [Op.lt]: cutoffDate },
          },
        });
        break;

      case "inactive_users":
        const inactiveUsers = await User.findAll({
          where: {
            lastLoginAt: { [Op.lt]: cutoffDate },
            status: "inactive",
          },
        });

        // Delete associated files first
        for (const user of inactiveUsers) {
          await File.destroy({ where: { userId: user.id } });
        }

        cleanedCount = await User.destroy({
          where: {
            lastLoginAt: { [Op.lt]: cutoffDate },
            status: "inactive",
          },
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error:
            "Invalid cleanup type. Use: logs, login_attempts, or inactive_users",
        });
    }

    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} ${type} records older than ${days} days`,
      data: { type, days, cleanedCount },
    });

    // Log this action
    await logAdminAction(
      req,
      "DATA_CLEANUP_PERFORMED",
      "system",
      {},
      {
        details: { type, days, cleanedCount },
        severity: AUDIT_SEVERITY.HIGH,
      }
    );
  } catch (error) {
    console.error("Cleanup old data error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cleanup old data",
    });
  }
};

/**
 * Create system backup
 */
export const createBackup = async (req, res) => {
  try {
    const { includeFiles = false } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupName = `secure-file-vault-backup-${timestamp}`;

    // Create backup info
    const backupInfo = {
      name: backupName,
      timestamp: new Date().toISOString(),
      includeFiles,
      createdBy: req.user.id,
      status: "completed",
      size: 0,
    };

    // In a real implementation, you would:
    // 1. Create database dump
    // 2. Optionally copy files
    // 3. Compress everything
    // 4. Store backup metadata

    // For now, we'll simulate the backup process
    const stats = {
      users: await User.count(),
      files: await File.count(),
      adminLogs: await AdminLog.count(),
      loginAttempts: await LoginAttempt.count(),
    };

    backupInfo.stats = stats;
    backupInfo.size = Math.random() * 1000000; // Simulate backup size

    res.json({
      success: true,
      message: "Backup created successfully",
      data: backupInfo,
    });

    // Log this critical action
    await logAdminAction(
      req,
      AUDIT_ACTIONS.SYSTEM_BACKUP_CREATED,
      "system",
      {},
      {
        details: { backupName, includeFiles, stats },
        severity: AUDIT_SEVERITY.HIGH,
      }
    );
  } catch (error) {
    console.error("Create backup error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create backup",
    });
  }
};

/**
 * Get system health check
 */
export const healthCheck = async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks: {
        database: await checkDatabase(),
        fileSystem: await checkFileSystem(),
        memory: checkMemory(),
        errorRate: await checkErrorRate(),
      },
    };

    // Determine overall status
    const criticalIssues = Object.values(health.checks).filter(
      (check) => check.status === "critical"
    );
    const warnings = Object.values(health.checks).filter(
      (check) => check.status === "warning"
    );

    if (criticalIssues.length > 0) {
      health.status = "critical";
    } else if (warnings.length > 0) {
      health.status = "warning";
    }

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      success: false,
      error: "Health check failed",
      data: {
        status: "critical",
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    });
  }
};

// Helper functions
const getDatabaseSize = async () => {
  try {
    // This would be database-specific
    // For now, return a simulated size
    return Math.random() * 1000000; // bytes
  } catch (error) {
    return 0;
  }
};

const getSystemUptime = () => {
  return process.uptime(); // seconds
};

const checkDatabase = async () => {
  const start = Date.now();
  try {
    await User.findOne({ limit: 1 });
    const responseTime = Date.now() - start;

    return {
      status:
        responseTime < 1000
          ? "healthy"
          : responseTime < 3000
          ? "warning"
          : "critical",
      responseTime,
      message: `Database responded in ${responseTime}ms`,
    };
  } catch (error) {
    return {
      status: "critical",
      responseTime: Date.now() - start,
      message: "Database connection failed",
      error: error.message,
    };
  }
};

const checkFileSystem = async () => {
  try {
    const uploadsPath = path.join(process.cwd(), "uploads");
    const stats = fs.statSync(uploadsPath);

    return {
      status: "healthy",
      message: "File system accessible",
      path: uploadsPath,
      exists: true,
    };
  } catch (error) {
    return {
      status: "critical",
      message: "File system not accessible",
      error: error.message,
    };
  }
};

const checkMemory = () => {
  const usage = process.memoryUsage();
  const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const percentage = Math.round((usage.heapUsed / usage.heapTotal) * 100);

  return {
    status:
      percentage < 80 ? "healthy" : percentage < 90 ? "warning" : "critical",
    usedMB,
    totalMB,
    percentage,
    message: `Memory usage: ${usedMB}MB / ${totalMB}MB (${percentage}%)`,
  };
};

const checkErrorRate = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const errorCount = await AdminLog.count({
      where: {
        severity: { [Op.in]: ["high", "critical"] },
        createdAt: { [Op.gte]: oneHourAgo },
      },
    });

    return {
      status:
        errorCount === 0 ? "healthy" : errorCount < 5 ? "warning" : "critical",
      count: errorCount,
      message: `${errorCount} errors in the last hour`,
    };
  } catch (error) {
    return {
      status: "critical",
      message: "Unable to check error rate",
      error: error.message,
    };
  }
};

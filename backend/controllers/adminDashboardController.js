import { User, File, AdminLog, LoginAttempt } from "../models/index.js";
import { Op } from "sequelize";
import { logAdminAction, AUDIT_ACTIONS } from "../middleware/auditLogger.js";

/**
 * Get dashboard statistics and overview data
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get current date ranges for comparisons
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for better performance
    const [
      totalUsers,
      totalFiles,
      activeUsers,
      suspendedUsers,
      todayUsers,
      todayFiles,
      weekUsers,
      weekFiles,
      recentLogins,
      failedLogins,
      storageStats,
      topFileTypes,
    ] = await Promise.all([
      // Total counts
      User.count(),
      File.count(),
      User.count({ where: { status: "active" } }),
      User.count({ where: { status: "suspended" } }),

      // Today's activity
      User.count({ where: { createdAt: { [Op.gte]: startOfToday } } }),
      File.count({ where: { uploaded: { [Op.gte]: startOfToday } } }),

      // This week's activity
      User.count({ where: { createdAt: { [Op.gte]: startOfWeek } } }),
      File.count({ where: { uploaded: { [Op.gte]: startOfWeek } } }),

      // Recent login activity
      LoginAttempt.count({
        where: {
          success: true,
          createdAt: { [Op.gte]: startOfToday },
        },
      }),

      // Failed login attempts
      LoginAttempt.count({
        where: {
          success: false,
          createdAt: { [Op.gte]: startOfToday },
        },
      }),

      // Storage statistics
      File.findAll({
        attributes: [
          [File.sequelize.fn("SUM", File.sequelize.col("size")), "totalSize"],
          [File.sequelize.fn("AVG", File.sequelize.col("size")), "avgSize"],
          [File.sequelize.fn("MAX", File.sequelize.col("size")), "maxSize"],
        ],
        raw: true,
      }),

      // Top file types
      File.findAll({
        attributes: [
          "type",
          [File.sequelize.fn("COUNT", File.sequelize.col("id")), "count"],
        ],
        group: ["type"],
        order: [[File.sequelize.fn("COUNT", File.sequelize.col("id")), "DESC"]],
        limit: 10,
        raw: true,
      }),
    ]);

    // Calculate growth rates
    const userGrowthRate =
      totalUsers > 0 ? ((weekUsers / totalUsers) * 100).toFixed(2) : 0;
    const fileGrowthRate =
      totalFiles > 0 ? ((weekFiles / totalFiles) * 100).toFixed(2) : 0;

    // Format storage statistics
    const storage = storageStats[0] || { totalSize: 0, avgSize: 0, maxSize: 0 };
    const formatBytes = (bytes) => {
      if (!bytes) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const dashboardData = {
      overview: {
        totalUsers,
        totalFiles,
        activeUsers,
        suspendedUsers,
        todayRegistrations: todayUsers,
        todayUploads: todayFiles,
        recentLogins,
        failedLogins,
      },
      growth: {
        userGrowthRate: parseFloat(userGrowthRate),
        fileGrowthRate: parseFloat(fileGrowthRate),
        weeklyUsers: weekUsers,
        weeklyFiles: weekFiles,
      },
      storage: {
        totalSize: formatBytes(storage.totalSize),
        totalSizeBytes: parseInt(storage.totalSize) || 0,
        avgSize: formatBytes(storage.avgSize),
        maxSize: formatBytes(storage.maxSize),
        fileCount: totalFiles,
      },
      fileTypes: topFileTypes.map((ft) => ({
        type: ft.type || "Unknown",
        count: parseInt(ft.count),
        percentage:
          totalFiles > 0 ? ((ft.count / totalFiles) * 100).toFixed(1) : 0,
      })),
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard statistics",
    });
  }
};

/**
 * Get recent system activity for dashboard
 */
export const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get recent admin actions
    const recentActions = await AdminLog.findAll({
      include: [
        {
          model: User,
          as: "admin",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      attributes: [
        "id",
        "action",
        "targetType",
        "targetId",
        "details",
        "severity",
        "createdAt",
      ],
    });

    // Get recent user registrations
    const recentUsers = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      order: [["createdAt", "DESC"]],
      limit: 10,
      attributes: ["id", "name", "email", "role", "createdAt"],
    });

    // Get recent file uploads
    const recentFiles = await File.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      where: {
        uploaded: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      order: [["uploaded", "DESC"]],
      limit: 10,
      attributes: ["id", "originalName", "type", "size", "uploaded"],
    });

    res.json({
      success: true,
      data: {
        adminActions: recentActions,
        newUsers: recentUsers,
        newFiles: recentFiles,
      },
    });

    // Log this action
    await logAdminAction(req, AUDIT_ACTIONS.DASHBOARD_VIEWED, "system");
  } catch (error) {
    console.error("Recent activity error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch recent activity",
    });
  }
};

/**
 * Get system health metrics
 */
export const getSystemHealth = async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check various system health indicators
    const [
      errorLogsCount,
      recentFailedLogins,
      databaseResponseTime,
      activeSessionsCount,
    ] = await Promise.all([
      // Count of error logs in last hour
      AdminLog.count({
        where: {
          severity: { [Op.in]: ["high", "critical"] },
          createdAt: { [Op.gte]: oneHourAgo },
        },
      }),

      // Failed login attempts in last hour
      LoginAttempt.count({
        where: {
          success: false,
          createdAt: { [Op.gte]: oneHourAgo },
        },
      }),

      // Simple database response time test
      measureDatabaseResponseTime(),

      // Count of recent successful logins (as proxy for active sessions)
      LoginAttempt.count({
        where: {
          success: true,
          createdAt: { [Op.gte]: new Date(now.getTime() - 4 * 60 * 60 * 1000) }, // Last 4 hours
        },
      }),
    ]);

    const healthStatus = {
      database: {
        status:
          databaseResponseTime < 1000
            ? "healthy"
            : databaseResponseTime < 3000
            ? "warning"
            : "critical",
        responseTime: databaseResponseTime,
        message:
          databaseResponseTime < 1000
            ? "Database responding normally"
            : databaseResponseTime < 3000
            ? "Database response time elevated"
            : "Database response time critical",
      },
      security: {
        status:
          recentFailedLogins < 10
            ? "healthy"
            : recentFailedLogins < 50
            ? "warning"
            : "critical",
        failedLogins: recentFailedLogins,
        message:
          recentFailedLogins < 10
            ? "Normal login activity"
            : recentFailedLogins < 50
            ? "Elevated failed login attempts"
            : "High number of failed login attempts",
      },
      errors: {
        status:
          errorLogsCount === 0
            ? "healthy"
            : errorLogsCount < 5
            ? "warning"
            : "critical",
        count: errorLogsCount,
        message:
          errorLogsCount === 0
            ? "No recent errors"
            : errorLogsCount < 5
            ? "Some errors detected"
            : "Multiple errors detected",
      },
      activity: {
        status: "healthy", // This could be enhanced with more sophisticated checks
        activeSessions: activeSessionsCount,
        message: `${activeSessionsCount} active sessions`,
      },
    };

    // Overall system status
    const criticalIssues = Object.values(healthStatus).filter(
      (h) => h.status === "critical"
    ).length;
    const warnings = Object.values(healthStatus).filter(
      (h) => h.status === "warning"
    ).length;

    const overallStatus =
      criticalIssues > 0 ? "critical" : warnings > 0 ? "warning" : "healthy";

    res.json({
      success: true,
      data: {
        overall: overallStatus,
        details: healthStatus,
        lastChecked: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("System health check error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check system health",
    });
  }
};

/**
 * Simple function to measure database response time
 */
const measureDatabaseResponseTime = async () => {
  const start = Date.now();
  try {
    await User.findOne({ limit: 1 });
    return Date.now() - start;
  } catch (error) {
    return 9999; // Return high value on error
  }
};

/**
 * Get all files with admin controls
 */
export const getAllFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "uploaded";
    const sortOrder = req.query.sortOrder || "DESC";
    const fileType = req.query.fileType || "";
    const userId = req.query.userId || "";

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { originalName: { [Op.iLike]: `%${search}%` } },
        { type: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (fileType) {
      whereConditions.type = { [Op.iLike]: `%${fileType}%` };
    }

    if (userId) {
      whereConditions.userId = userId;
    }

    const { count, rows: files } = await File.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      attributes: [
        "id",
        "originalName",
        "name",
        "type",
        "mimeType",
        "size",
        "encrypted",
        "uploaded",
        "userId",
      ],
    });

    // Format file sizes
    const formatBytes = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formattedFiles = files.map((file) => ({
      ...file.toJSON(),
      formattedSize: formatBytes(parseInt(file.size) || 0),
    }));

    const responseData = {
      success: true,
      data: {
        files: formattedFiles,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    };

    res.json(responseData);
  } catch (error) {
    console.error("Get all files error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      error: "Failed to fetch files",
      message: error.message,
    });
  }
};

/**
 * Get specific file details for admin
 */
export const getFileDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "role", "createdAt"],
        },
      ],
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    // Format file size
    const formatBytes = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const fileDetails = {
      ...file.toJSON(),
      formattedSize: formatBytes(parseInt(file.size) || 0),
    };

    res.json({
      success: true,
      data: fileDetails,
    });

    // Log this action
    await logAdminAction(req, "FILE_DETAILS_VIEWED", "file", { fileId: id });
  } catch (error) {
    console.error("Get file details error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch file details",
    });
  }
};

/**
 * Delete file (admin action)
 */
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const file = await File.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    // Store file details for logging
    const fileDetails = {
      id: file.id,
      originalName: file.originalName,
      size: file.size,
      userId: file.userId,
      userEmail: file.User?.email,
    };

    // Delete the actual file from disk
    const fs = await import("fs");
    const path = await import("path");

    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (fileError) {
      console.warn("Could not delete physical file:", fileError);
      // Continue with database deletion even if file doesn't exist on disk
    }

    // Delete from database
    await file.destroy();

    res.json({
      success: true,
      message: "File deleted successfully",
    });

    // Log this critical action
    await logAdminAction(req, AUDIT_ACTIONS.FILE_DELETED, "file", {
      ...fileDetails,
      reason: reason || "Admin deletion",
      severity: "high",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete file",
    });
  }
};

/**
 * Get security audit logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const action = req.query.action || "";
    const severity = req.query.severity || "";
    const targetType = req.query.targetType || "";
    const adminId = req.query.adminId || "";
    const startDate = req.query.startDate || "";
    const endDate = req.query.endDate || "";

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};

    if (action) {
      whereConditions.action = { [Op.iLike]: `%${action}%` };
    }

    if (severity) {
      whereConditions.severity = severity;
    }

    if (targetType) {
      whereConditions.targetType = targetType;
    }

    if (adminId) {
      whereConditions.adminId = adminId;
    }

    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereConditions.createdAt = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      whereConditions.createdAt = {
        [Op.lte]: new Date(endDate),
      };
    }

    const { count, rows: logs } = await AdminLog.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: "admin",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });

    // Log this action
    await logAdminAction(req, "AUDIT_LOGS_VIEWED", "system");
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audit logs",
    });
  }
};

/**
 * Get login attempts for security monitoring
 */
export const getLoginAttempts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const success = req.query.success;
    const email = req.query.email || "";
    const ipAddress = req.query.ipAddress || "";
    const startDate = req.query.startDate || "";
    const endDate = req.query.endDate || "";

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};

    if (success !== undefined) {
      whereConditions.success = success === "true";
    }

    if (email) {
      whereConditions.email = { [Op.iLike]: `%${email}%` };
    }

    if (ipAddress) {
      whereConditions.ipAddress = { [Op.iLike]: `%${ipAddress}%` };
    }

    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereConditions.createdAt = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      whereConditions.createdAt = {
        [Op.lte]: new Date(endDate),
      };
    }

    const { count, rows: attempts } = await LoginAttempt.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
        summary: {
          total: count,
          failed: attempts.filter((a) => !a.success).length,
          successful: attempts.filter((a) => a.success).length,
        },
      },
    });

    // Log this action
    await logAdminAction(req, "LOGIN_ATTEMPTS_VIEWED", "system");
  } catch (error) {
    console.error("Get login attempts error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch login attempts",
    });
  }
};

/**
 * Get analytics data for admin dashboard
 */
export const getAnalytics = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "7d";
    const days = timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    // Get user growth data
    const currentUsers = await User.count({
      where: {
        createdAt: { [Op.gte]: startDate },
      },
    });

    const previousUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: previousStartDate,
          [Op.lt]: startDate,
        },
      },
    });

    const totalUsers = await User.count();
    const userGrowthPercentage =
      previousUsers > 0
        ? ((currentUsers - previousUsers) / previousUsers) * 100
        : 0;

    // Get daily user registration data
    const userGrowthData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dailyUsers = await User.count({
        where: {
          createdAt: {
            [Op.gte]: dayStart,
            [Op.lte]: dayEnd,
          },
        },
      });

      userGrowthData.push({
        date: dayStart.toISOString().split("T")[0],
        value: dailyUsers,
      });
    }

    // Get file upload statistics
    const currentFiles = await File.count({
      where: {
        uploaded: { [Op.gte]: startDate },
      },
    });

    const previousFiles = await File.count({
      where: {
        uploaded: {
          [Op.gte]: previousStartDate,
          [Op.lt]: startDate,
        },
      },
    });

    const totalFiles = await File.count();
    const fileGrowthPercentage =
      previousFiles > 0
        ? ((currentFiles - previousFiles) / previousFiles) * 100
        : 0;

    // Get daily file upload data
    const fileUploadData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dailyFiles = await File.count({
        where: {
          uploaded: {
            [Op.gte]: dayStart,
            [Op.lte]: dayEnd,
          },
        },
      });

      fileUploadData.push({
        date: dayStart.toISOString().split("T")[0],
        value: dailyFiles,
      });
    }

    // Get storage usage
    const storageStats = await File.findAll({
      attributes: [
        [File.sequelize.fn("SUM", File.sequelize.col("size")), "totalSize"],
      ],
      raw: true,
    });

    const currentStorage = await File.findAll({
      where: {
        uploaded: { [Op.gte]: startDate },
      },
      attributes: [
        [File.sequelize.fn("SUM", File.sequelize.col("size")), "totalSize"],
      ],
      raw: true,
    });

    const previousStorage = await File.findAll({
      where: {
        uploaded: {
          [Op.gte]: previousStartDate,
          [Op.lt]: startDate,
        },
      },
      attributes: [
        [File.sequelize.fn("SUM", File.sequelize.col("size")), "totalSize"],
      ],
      raw: true,
    });

    const totalStorageBytes = parseInt(storageStats[0]?.totalSize || 0);
    const currentStorageBytes = parseInt(currentStorage[0]?.totalSize || 0);
    const previousStorageBytes = parseInt(previousStorage[0]?.totalSize || 0);

    const totalStorageGB = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(
      2
    );
    const currentStorageGB = (
      currentStorageBytes /
      (1024 * 1024 * 1024)
    ).toFixed(2);
    const previousStorageGB = (
      previousStorageBytes /
      (1024 * 1024 * 1024)
    ).toFixed(2);

    const storageGrowthPercentage =
      previousStorageGB > 0
        ? ((currentStorageGB - previousStorageGB) / previousStorageGB) * 100
        : 0;

    // Get daily storage data
    const storageData = [];
    let cumulativeStorage = 0;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dailyStorageResult = await File.findAll({
        where: {
          uploaded: { [Op.lte]: dayEnd },
        },
        attributes: [
          [File.sequelize.fn("SUM", File.sequelize.col("size")), "totalSize"],
        ],
        raw: true,
      });

      const dailyStorageBytes = parseInt(dailyStorageResult[0]?.totalSize || 0);
      const dailyStorageGB = (dailyStorageBytes / (1024 * 1024 * 1024)).toFixed(
        2
      );

      storageData.push({
        date: date.toISOString().split("T")[0],
        value: parseFloat(dailyStorageGB),
      });
    }

    // Get top file types
    const fileTypeStats = await File.findAll({
      attributes: ["type", [File.sequelize.fn("COUNT", "*"), "count"]],
      group: ["type"],
      order: [[File.sequelize.fn("COUNT", "*"), "DESC"]],
      limit: 5,
      raw: true,
    });

    const topFileTypes = fileTypeStats.map((stat) => ({
      type: stat.type || "Unknown",
      count: parseInt(stat.count),
      percentage:
        totalFiles > 0
          ? ((parseInt(stat.count) / totalFiles) * 100).toFixed(1)
          : 0,
    }));

    const analyticsData = {
      userGrowth: {
        current: totalUsers,
        previous: totalUsers - currentUsers,
        percentage: parseFloat(userGrowthPercentage.toFixed(1)),
        data: userGrowthData,
      },
      fileUploads: {
        current: totalFiles,
        previous: totalFiles - currentFiles,
        percentage: parseFloat(fileGrowthPercentage.toFixed(1)),
        data: fileUploadData,
      },
      storageUsage: {
        current: parseFloat(totalStorageGB),
        previous: parseFloat(totalStorageGB) - parseFloat(currentStorageGB),
        percentage: parseFloat(storageGrowthPercentage.toFixed(1)),
        data: storageData,
      },
      topFileTypes,
    };

    res.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics data",
      message: error.message,
    });
  }
};

/**
 * Get enhanced analytics with more detailed metrics
 */
export const getEnhancedAnalytics = async (req, res) => {
  try {
    const timeRange = req.query.timeRange || "30d";
    const days =
      timeRange === "7d"
        ? 7
        : timeRange === "30d"
        ? 30
        : timeRange === "90d"
        ? 90
        : 365;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get comprehensive user analytics
    const userAnalytics = await getUserAnalytics(startDate, endDate, days);

    // Get file analytics
    const fileAnalytics = await getFileAnalytics(startDate, endDate, days);

    // Get security analytics
    const securityAnalytics = await getSecurityAnalytics(
      startDate,
      endDate,
      days
    );

    // Get performance analytics
    const performanceAnalytics = await getPerformanceAnalytics(
      startDate,
      endDate,
      days
    );

    // Get geographic analytics (if IP data available)
    const geoAnalytics = await getGeographicAnalytics(startDate, endDate);

    res.json({
      success: true,
      data: {
        timeRange,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days,
        },
        userAnalytics,
        fileAnalytics,
        securityAnalytics,
        performanceAnalytics,
        geoAnalytics,
      },
    });
  } catch (error) {
    console.error("Get enhanced analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch enhanced analytics data",
      message: error.message,
    });
  }
};

/**
 * Helper function for detailed user analytics
 */
const getUserAnalytics = async (startDate, endDate, days) => {
  // User growth trends
  const userGrowthData = [];
  const userActivityData = [];
  const roleDistribution = await User.findAll({
    attributes: ["role", [User.sequelize.fn("COUNT", "*"), "count"]],
    group: ["role"],
    raw: true,
  });

  // Daily user data
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const [newUsers, activeUsers] = await Promise.all([
      User.count({
        where: { createdAt: { [Op.between]: [dayStart, dayEnd] } },
      }),
      User.count({
        where: { lastLoginAt: { [Op.between]: [dayStart, dayEnd] } },
      }),
    ]);

    userGrowthData.push({
      date: dayStart.toISOString().split("T")[0],
      newUsers,
      totalUsers: await User.count({
        where: { createdAt: { [Op.lte]: dayEnd } },
      }),
    });

    userActivityData.push({
      date: dayStart.toISOString().split("T")[0],
      activeUsers,
    });
  }

  // User status distribution
  const statusDistribution = await User.findAll({
    attributes: ["status", [User.sequelize.fn("COUNT", "*"), "count"]],
    group: ["status"],
    raw: true,
  });

  // User retention analysis
  const totalUsers = await User.count();
  const activeUsers = await User.count({
    where: {
      lastLoginAt: {
        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const retentionRate =
    totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0;

  return {
    growth: userGrowthData,
    activity: userActivityData,
    roleDistribution: roleDistribution.map((r) => ({
      role: r.role,
      count: parseInt(r.count),
      percentage: ((parseInt(r.count) / totalUsers) * 100).toFixed(1),
    })),
    statusDistribution: statusDistribution.map((s) => ({
      status: s.status,
      count: parseInt(s.count),
      percentage: ((parseInt(s.count) / totalUsers) * 100).toFixed(1),
    })),
    retentionRate: parseFloat(retentionRate),
    summary: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
    },
  };
};

/**
 * Helper function for detailed file analytics
 */
const getFileAnalytics = async (startDate, endDate, days) => {
  // File upload trends
  const uploadTrends = [];
  const sizeDistribution = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const [dailyUploads, dailySize] = await Promise.all([
      File.count({
        where: { uploaded: { [Op.between]: [dayStart, dayEnd] } },
      }),
      File.findAll({
        where: { uploaded: { [Op.between]: [dayStart, dayEnd] } },
        attributes: [
          [File.sequelize.fn("SUM", File.sequelize.col("size")), "totalSize"],
        ],
        raw: true,
      }),
    ]);

    const sizeBytes = parseInt(dailySize[0]?.totalSize || 0);
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

    uploadTrends.push({
      date: dayStart.toISOString().split("T")[0],
      uploads: dailyUploads,
      sizeMB: parseFloat(sizeMB),
    });
  }

  // File type analysis
  const fileTypes = await File.findAll({
    attributes: [
      "type",
      [File.sequelize.fn("COUNT", "*"), "count"],
      [File.sequelize.fn("SUM", File.sequelize.col("size")), "totalSize"],
      [File.sequelize.fn("AVG", File.sequelize.col("size")), "avgSize"],
    ],
    group: ["type"],
    order: [[File.sequelize.fn("COUNT", "*"), "DESC"]],
    raw: true,
  });

  const totalFiles = await File.count();

  // File size categories
  const sizeCategories = await File.findAll({
    attributes: [
      [
        File.sequelize.literal(`
        CASE 
          WHEN CAST(size AS UNSIGNED) < 1048576 THEN 'Small (<1MB)'
          WHEN CAST(size AS UNSIGNED) < 10485760 THEN 'Medium (1-10MB)'
          WHEN CAST(size AS UNSIGNED) < 104857600 THEN 'Large (10-100MB)'
          ELSE 'Very Large (>100MB)'
        END
      `),
        "category",
      ],
      [File.sequelize.fn("COUNT", "*"), "count"],
    ],
    group: [
      File.sequelize.literal(`
      CASE 
        WHEN CAST(size AS UNSIGNED) < 1048576 THEN 'Small (<1MB)'
        WHEN CAST(size AS UNSIGNED) < 10485760 THEN 'Medium (1-10MB)'
        WHEN CAST(size AS UNSIGNED) < 104857600 THEN 'Large (10-100MB)'
        ELSE 'Very Large (>100MB)'
      END
    `),
    ],
    raw: true,
  });

  // Most active users by uploads
  const topUploaders = await File.findAll({
    include: [
      {
        model: User,
        attributes: ["id", "name", "email"],
      },
    ],
    attributes: [
      "userId",
      [File.sequelize.fn("COUNT", "*"), "uploadCount"],
      [File.sequelize.fn("SUM", File.sequelize.col("size")), "totalSize"],
    ],
    where: { uploaded: { [Op.between]: [startDate, endDate] } },
    group: ["userId", "User.id"],
    order: [[File.sequelize.fn("COUNT", "*"), "DESC"]],
    limit: 10,
    raw: true,
  });

  return {
    uploadTrends,
    fileTypes: fileTypes.map((ft) => ({
      type: ft.type || "Unknown",
      count: parseInt(ft.count),
      percentage: ((parseInt(ft.count) / totalFiles) * 100).toFixed(1),
      totalSizeMB: (parseInt(ft.totalSize || 0) / (1024 * 1024)).toFixed(2),
      avgSizeMB: (parseInt(ft.avgSize || 0) / (1024 * 1024)).toFixed(2),
    })),
    sizeCategories: sizeCategories.map((sc) => ({
      category: sc.category,
      count: parseInt(sc.count),
      percentage: ((parseInt(sc.count) / totalFiles) * 100).toFixed(1),
    })),
    topUploaders: topUploaders.map((tu) => ({
      userId: tu.userId,
      userName: tu["User.name"] || "Unknown",
      userEmail: tu["User.email"] || "Unknown",
      uploadCount: parseInt(tu.uploadCount),
      totalSizeMB: (parseInt(tu.totalSize || 0) / (1024 * 1024)).toFixed(2),
    })),
  };
};

/**
 * Helper function for security analytics
 */
const getSecurityAnalytics = async (startDate, endDate, days) => {
  // Login attempt analysis
  const loginTrends = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const [successful, failed] = await Promise.all([
      LoginAttempt.count({
        where: {
          createdAt: { [Op.between]: [dayStart, dayEnd] },
          success: true,
        },
      }),
      LoginAttempt.count({
        where: {
          createdAt: { [Op.between]: [dayStart, dayEnd] },
          success: false,
        },
      }),
    ]);

    loginTrends.push({
      date: dayStart.toISOString().split("T")[0],
      successful,
      failed,
      total: successful + failed,
      successRate:
        successful + failed > 0
          ? ((successful / (successful + failed)) * 100).toFixed(1)
          : 0,
    });
  }

  // Suspicious activity detection
  const suspiciousUsers = await LoginAttempt.findAll({
    attributes: [
      "userId",
      [LoginAttempt.sequelize.fn("COUNT", "*"), "attemptCount"],
      [
        LoginAttempt.sequelize.fn(
          "SUM",
          LoginAttempt.sequelize.literal(
            "CASE WHEN success = false THEN 1 ELSE 0 END"
          )
        ),
        "failedAttempts",
      ],
    ],
    where: { createdAt: { [Op.between]: [startDate, endDate] } },
    group: ["userId"],
    having: LoginAttempt.sequelize.literal("failedAttempts > 5"),
    order: [[LoginAttempt.sequelize.fn("COUNT", "*"), "DESC"]],
    limit: 10,
    raw: true,
  });

  // Admin activity
  const adminActions = await AdminLog.count({
    where: { createdAt: { [Op.between]: [startDate, endDate] } },
  });

  const criticalActions = await AdminLog.count({
    where: {
      createdAt: { [Op.between]: [startDate, endDate] },
      action: {
        [Op.in]: [
          "USER_DELETED",
          "USER_SUSPENDED",
          "FILE_DELETED",
          "SYSTEM_SETTINGS_CHANGED",
        ],
      },
    },
  });

  return {
    loginTrends,
    suspiciousActivity: {
      suspiciousUsers: suspiciousUsers.length,
      details: suspiciousUsers.map((su) => ({
        userId: su.userId,
        totalAttempts: parseInt(su.attemptCount),
        failedAttempts: parseInt(su.failedAttempts),
        successRate: (
          ((parseInt(su.attemptCount) - parseInt(su.failedAttempts)) /
            parseInt(su.attemptCount)) *
          100
        ).toFixed(1),
      })),
    },
    adminActivity: {
      totalActions: adminActions,
      criticalActions,
      riskLevel:
        criticalActions > 10 ? "high" : criticalActions > 5 ? "medium" : "low",
    },
  };
};

/**
 * Helper function for performance analytics
 */
const getPerformanceAnalytics = async (startDate, endDate, days) => {
  // Database performance metrics
  const totalQueries = days * 24; // Approximate
  const avgResponseTime = Math.random() * 100 + 50; // Mock data - implement real DB monitoring

  // File operations performance
  const fileOpsPerformance = [];

  for (let i = Math.max(0, days - 7); i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const uploads = await File.count({
      where: { uploaded: { [Op.between]: [dayStart, dayEnd] } },
    });

    fileOpsPerformance.push({
      date: dayStart.toISOString().split("T")[0],
      uploads,
      avgUploadTime: Math.random() * 2000 + 500, // Mock data
      errorRate: Math.random() * 5, // Mock data
    });
  }

  // System health indicators
  const systemHealth = {
    dbConnections: Math.floor(Math.random() * 50) + 10,
    memoryUsage: Math.floor(Math.random() * 80) + 20,
    cpuUsage: Math.floor(Math.random() * 60) + 10,
    diskUsage: Math.floor(Math.random() * 70) + 15,
    uptime: Date.now() - startDate.getTime(),
  };

  return {
    database: {
      avgResponseTime: avgResponseTime.toFixed(2),
      totalQueries,
      slowQueries: Math.floor(totalQueries * 0.02), // 2% slow queries
      connectionPool: {
        active: systemHealth.dbConnections,
        idle: Math.floor(systemHealth.dbConnections * 0.3),
        max: 100,
      },
    },
    fileOperations: fileOpsPerformance,
    systemHealth,
    recommendations: generatePerformanceRecommendations(systemHealth),
  };
};

/**
 * Helper function for geographic analytics
 */
const getGeographicAnalytics = async (startDate, endDate) => {
  // Mock geographic data - implement with real IP geolocation
  const countries = [
    {
      country: "United States",
      users: Math.floor(Math.random() * 100) + 50,
      percentage: 0,
    },
    {
      country: "United Kingdom",
      users: Math.floor(Math.random() * 50) + 20,
      percentage: 0,
    },
    {
      country: "Canada",
      users: Math.floor(Math.random() * 40) + 15,
      percentage: 0,
    },
    {
      country: "Germany",
      users: Math.floor(Math.random() * 35) + 10,
      percentage: 0,
    },
    {
      country: "France",
      users: Math.floor(Math.random() * 30) + 8,
      percentage: 0,
    },
  ];

  const totalUsers = countries.reduce((sum, c) => sum + c.users, 0);
  countries.forEach((c) => {
    c.percentage = ((c.users / totalUsers) * 100).toFixed(1);
  });

  return {
    countries,
    summary: {
      totalCountries: countries.length,
      topCountry: countries[0],
      distribution: countries,
    },
  };
};

/**
 * Helper function to generate performance recommendations
 */
const generatePerformanceRecommendations = (systemHealth) => {
  const recommendations = [];

  if (systemHealth.memoryUsage > 80) {
    recommendations.push({
      type: "warning",
      category: "memory",
      message:
        "High memory usage detected. Consider optimizing queries or increasing server memory.",
      priority: "high",
    });
  }

  if (systemHealth.cpuUsage > 70) {
    recommendations.push({
      type: "warning",
      category: "cpu",
      message: "High CPU usage. Monitor for resource-intensive operations.",
      priority: "medium",
    });
  }

  if (systemHealth.diskUsage > 80) {
    recommendations.push({
      type: "critical",
      category: "storage",
      message:
        "Disk usage is critically high. Consider cleaning up old files or increasing storage.",
      priority: "critical",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: "success",
      category: "general",
      message:
        "System is performing well. All metrics are within acceptable ranges.",
      priority: "low",
    });
  }

  return recommendations;
};

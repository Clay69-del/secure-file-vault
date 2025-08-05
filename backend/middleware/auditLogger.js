import { AdminLog } from "../models/index.js";

/**
 * Middleware to log admin actions
 * Should be used after adminMiddleware to ensure req.user is available
 */
const auditLogger = (action, targetType, options = {}) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;

    res.json = function (data) {
      // Log the action after successful response
      logAdminAction(req, action, targetType, data, options).catch((err) =>
        console.error("Audit logging failed:", err)
      );

      // Call original res.json
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Function to manually log admin actions
 * Can be called directly from controllers for more control
 */
const logAdminAction = async (
  req,
  action,
  targetType,
  responseData = {},
  options = {}
) => {
  try {
    if (!req || !req.user || !req.user.id) {
      console.warn(
        "Cannot log admin action: no user in request or request is undefined"
      );
      return;
    }

    const {
      targetId = null,
      details = {},
      severity = "medium",
      skipLogging = false,
    } = options;

    if (skipLogging) return;

    // Extract additional details from request and response
    const logDetails = {
      ...details,
      method: req.method,
      url: req.originalUrl,
      params: req.params || {},
      query: req.query || {},
      success: !responseData.error,
      ...((responseData.error || responseData.message) && {
        message: responseData.error || responseData.message,
      }),
    };

    // Create audit log entry
    await AdminLog.create({
      adminId: req.user.id,
      action,
      targetType,
      targetId: targetId || extractTargetId(req, targetType),
      details: logDetails,
      ipAddress: getClientIP(req),
      userAgent: req.get ? req.get("User-Agent") : null,
      severity,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw error to avoid breaking the main request
  }
};

/**
 * Extract target ID from request parameters
 */
const extractTargetId = (req, targetType) => {
  if (!req) return null;
  if (req.params?.id) return req.params.id;
  if (req.params?.userId && targetType === "user") return req.params.userId;
  if (req.params?.fileId && targetType === "file") return req.params.fileId;
  if (req.body?.id) return req.body.id.toString();
  return null;
};

/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
  if (!req) return "unknown";

  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.headers?.["x-forwarded-for"]?.split(",")[0] ||
    "unknown"
  );
};

/**
 * Predefined audit actions for common operations
 */
const AUDIT_ACTIONS = {
  // User management
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DELETED: "USER_DELETED",
  USER_SUSPENDED: "USER_SUSPENDED",
  USER_UNSUSPENDED: "USER_UNSUSPENDED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",

  // File management
  FILE_VIEWED: "FILE_VIEWED",
  FILE_DELETED: "FILE_DELETED",
  FILE_BULK_DELETE: "FILE_BULK_DELETE",

  // System management
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
  SETTINGS_VIEWED: "SETTINGS_VIEWED",
  MAINTENANCE_MODE_TOGGLED: "MAINTENANCE_MODE_TOGGLED",
  SYSTEM_BACKUP_CREATED: "SYSTEM_BACKUP_CREATED",
  DASHBOARD_VIEWED: "DASHBOARD_VIEWED",

  // Security
  ADMIN_LOGIN: "ADMIN_LOGIN",
  SECURITY_ALERT_CREATED: "SECURITY_ALERT_CREATED",
  SECURITY_SETTINGS_CHANGED: "SECURITY_SETTINGS_CHANGED",
};

/**
 * Predefined severity levels
 */
const AUDIT_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export { auditLogger, logAdminAction, AUDIT_ACTIONS, AUDIT_SEVERITY };
export default auditLogger;

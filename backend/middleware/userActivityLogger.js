import { UserActivity } from "../models/index.js";

/**
 * Function to log user activities
 * Can be called directly from controllers
 */
const logUserActivity = async (
  userId,
  action,
  targetType,
  options = {},
  req = null
) => {
  try {
    if (!userId) {
      console.warn("Cannot log user activity: no userId provided");
      return;
    }

    const {
      targetId = null,
      fileName = null,
      fileSize = null,
      details = {},
    } = options;

    // Extract IP and user agent from request if available
    const ipAddress = req ? getClientIP(req) : null;
    const userAgent = req && req.get ? req.get("User-Agent") : null;

    // Create user activity log entry
    await UserActivity.create({
      userId,
      action,
      targetType,
      targetId,
      fileName,
      fileSize,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error("Failed to create user activity log:", error);
    // Don't throw error to avoid breaking the main request
  }
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
 * Predefined user actions for common operations
 */
const USER_ACTIONS = {
  // Authentication
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  REGISTER: "REGISTER",

  // File operations
  FILE_UPLOAD: "FILE_UPLOAD",
  FILE_DOWNLOAD: "FILE_DOWNLOAD",
  FILE_VIEW: "FILE_VIEW",
  FILE_DELETE: "FILE_DELETE",

  // Profile operations
  PROFILE_UPDATE: "PROFILE_UPDATE",
  PROFILE_PICTURE_UPDATE: "PROFILE_PICTURE_UPDATE",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",

  // System operations
  DASHBOARD_VIEW: "DASHBOARD_VIEW",
};

/**
 * Target types for activities
 */
const TARGET_TYPES = {
  FILE: "file",
  PROFILE: "profile",
  SYSTEM: "system",
};

export { logUserActivity, USER_ACTIONS, TARGET_TYPES };
export default logUserActivity;

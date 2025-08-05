import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

/**
 * Middleware to verify admin role
 * Requires user to be authenticated AND have admin or super_admin role
 */
const adminMiddleware = async (req, res, next) => {
  try {
    // First check if user is authenticated
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authorization token required",
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database to check current role and status
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "role", "status"],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if user account is active
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        error: "Account is suspended or inactive",
      });
    }

    // Check if user has admin privileges
    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: "Admin access required",
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

/**
 * Middleware to verify super admin role
 * More restrictive than adminMiddleware - only super_admin can access
 */
const superAdminMiddleware = async (req, res, next) => {
  try {
    // First run admin middleware
    await new Promise((resolve, reject) => {
      adminMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is super admin
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        error: "Super admin access required",
      });
    }

    next();
  } catch (err) {
    // Error already handled by adminMiddleware
    return;
  }
};

export { adminMiddleware, superAdminMiddleware };
export default adminMiddleware;

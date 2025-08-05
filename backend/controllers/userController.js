import { User, UserActivity } from "../models/index.js";
import bcrypt from "bcryptjs";
import path from "path";
import { Op } from "sequelize";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "name",
        "email",
        "profilePicture",
        "createdAt",
        "updatedAt",
      ],
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name && !email) {
      return res
        .status(400)
        .json({ error: "Name or email is required to update profile" });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.error("User not found for update:", req.user.id);
      return res.status(404).json({ error: "User not found" });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save().catch((saveErr) => {
      console.error("Error saving user during profile update:", saveErr);
      throw new Error("Database save failed");
    });
    res.json({
      message: "Profile updated",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res
      .status(500)
      .json({ error: "Failed to update profile", details: err.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!req.user || !req.user.id) {
      console.error("No authenticated user found in request");
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.error(`User not found: ${req.user.id}`);
      return res.status(404).json({ error: "User not found" });
    }
    user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    await user.save().catch((saveErr) => {
      console.error("Error saving user:", saveErr);
      throw new Error("Database save failed");
    });
    res.json({
      message: "Profile picture updated",
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    console.error("Profile picture upload error:", err);
    res
      .status(500)
      .json({
        error: "Failed to upload profile picture",
        details: err.message,
      });
  }
};
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ error: "Current and new password required" });
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return res.status(401).json({ error: "Current password is incorrect" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to change password" });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, timeRange = 7 } = req.query;
    const userId = req.user.id;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    // Build where clause
    const whereClause = {
      userId,
      createdAt: {
        [Op.gte]: startDate,
      },
    };

    if (action && action !== "all") {
      whereClause.action = action;
    }

    // Fetch activities with pagination
    const activities = await UserActivity.findAndCountAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      attributes: [
        "id",
        "action",
        "targetType",
        "targetId",
        "fileName",
        "fileSize",
        "details",
        "createdAt",
      ],
    });

    // Format the activities for frontend consumption
    const formattedActivities = activities.rows.map((activity) => ({
      id: activity.id,
      action: activity.action,
      targetType: activity.targetType,
      targetId: activity.targetId,
      fileName: activity.fileName,
      fileSize: activity.fileSize,
      details: activity.details,
      timestamp: activity.createdAt,
      description: formatActivityDescription(activity),
    }));

    res.json({
      success: true,
      data: {
        activities: formattedActivities,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: activities.count,
          totalPages: Math.ceil(activities.count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user activity",
    });
  }
};

// Helper function to format activity descriptions
const formatActivityDescription = (activity) => {
  switch (activity.action) {
    case "FILE_UPLOAD":
      return `Uploaded ${activity.fileName}`;
    case "FILE_DOWNLOAD":
      return `Downloaded ${activity.fileName}`;
    case "FILE_VIEW":
      return `Viewed ${activity.fileName}`;
    case "FILE_DELETE":
      return `Deleted ${activity.fileName}`;
    case "LOGIN":
      return "Logged in";
    case "LOGOUT":
      return "Logged out";
    case "PROFILE_UPDATE":
      return "Updated profile";
    case "PROFILE_PICTURE_UPDATE":
      return "Updated profile picture";
    case "PASSWORD_CHANGE":
      return "Changed password";
    case "DASHBOARD_VIEW":
      return "Viewed dashboard";
    default:
      return `Performed action: ${activity.action}`;
  }
};

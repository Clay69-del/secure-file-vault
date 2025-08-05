import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  changePassword,
  getUserActivity,
} from "../controllers/userController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer config for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/profile-pictures"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB limit

// Get current user's profile
router.get("/me", authMiddleware, getProfile);

// Update profile details (name, email)
router.put("/me", authMiddleware, updateProfile);

// Upload/change profile picture
router.post(
  "/me/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture
);

// Change password
router.put("/me/password", authMiddleware, changePassword);

// Get user activity history
router.get("/me/activity", authMiddleware, getUserActivity);

export default router;

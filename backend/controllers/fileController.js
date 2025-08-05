// File: controllers/fileController.js

import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { sequelize } from "../models/index.js";
import { File, User } from "../models/index.js";
import {
  logUserActivity,
  USER_ACTIONS,
  TARGET_TYPES,
} from "../middleware/userActivityLogger.js";

// Configuration
const UPLOAD_DIR = path.join("uploads");
const MAX_FILE_SIZE_MB = 50; // 50MB max file size
const ALLOWED_FILE_TYPES = [
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",

  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",

  // Archives
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
];

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// AES Encryption Config
const algorithm = "aes-256-cbc";
const secretKey =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
// Remove global iv

// Helper function for consistent API responses
const createResponse = (success, data = {}, message = "") => {
  return {
    success,
    message,
    ...(Object.keys(data).length > 0 && { data }),
  };
};

// Update encryptFile to accept IV
const encryptFile = (filePath, outputFilePath, iv) => {
  return new Promise((resolve, reject) => {
    try {
      const cipher = crypto.createCipheriv(
        algorithm,
        Buffer.from(secretKey, "hex"),
        iv
      );
      const input = fs.createReadStream(filePath);
      const output = fs.createWriteStream(outputFilePath);
      output.on("finish", () => resolve());
      output.on("error", (err) => reject(err));
      input.on("error", (err) => reject(err));
      cipher.on("error", (err) => reject(err));
      input.pipe(cipher).pipe(output);
    } catch (err) {
      reject(err);
    }
  });
};

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Sanitize filename to prevent path traversal
    const safeFilename = file.originalname.replace(/[^\w\d_.-]/g, "_");
    cb(null, uniqueSuffix + "-" + safeFilename);
  },
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, // Convert MB to bytes
    files: 1, // Allow only single file upload
  },
});

// Upload Handler
const uploadFile = async (req, res) => {
  // Check if file exists in the request
  if (!req.file) {
    return res
      .status(400)
      .json(createResponse(false, {}, "No file uploaded or invalid file type"));
  }

  let tempFilePath = "";
  try {
    const user = req.user; // User is authenticated via authMiddleware
    const file = req.file;
    tempFilePath = file.path;

    // Additional file validation
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      throw new Error(`File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB`);
    }

    const fileExt = path.extname(file.originalname).toLowerCase().substring(1);
    const encryptedFileName = `enc-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const encryptedFilePath = path.join(UPLOAD_DIR, encryptedFileName);

    // Generate a random IV for this file
    const fileIv = crypto.randomBytes(16);

    // Encrypt the file and wait for completion
    await encryptFile(file.path, encryptedFilePath, fileIv);

    // Verify the encrypted file was created
    if (!fs.existsSync(encryptedFilePath)) {
      throw new Error("Failed to create encrypted file");
    }

    // Only delete original file after successful encryption
    fs.unlinkSync(file.path);
    tempFilePath = ""; // Clear temp file path since we've deleted it

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    // Find or create user by email
    let dbUser = await User.findOne({ where: { email: user.email } });
    if (!dbUser) {
      dbUser = await User.create({
        googleId: user.id || "",
        name: user.name,
        email: user.email,
        picture: user.picture || "",
      });
    }

    const fileRecord = await File.create({
      userId: dbUser.id,
      originalName: file.originalname,
      name: encryptedFileName,
      type: path.extname(file.originalname).slice(1),
      mimeType: file.mimetype,
      size: fileSizeMB,
      path: encryptedFilePath,
      encrypted: true,
      uploaded: new Date(),
      iv: fileIv.toString("hex"),
    });

    // Log the file upload activity
    await logUserActivity(
      dbUser.id,
      USER_ACTIONS.FILE_UPLOAD,
      TARGET_TYPES.FILE,
      {
        targetId: fileRecord.id,
        fileName: file.originalname,
        fileSize: file.size,
        details: {
          mimeType: file.mimetype,
          encrypted: true,
        },
      },
      req
    );

    // Return success response with file details
    res.status(201).json(
      createResponse(
        true,
        {
          id: fileRecord.id,
          name: file.originalname,
          type: fileRecord.type,
          size: fileRecord.size,
          uploaded: fileRecord.uploaded,
          encrypted: fileRecord.encrypted,
          downloadUrl: `/api/files/download/${fileRecord.id}`,
        },
        "File uploaded and encrypted successfully."
      )
    );
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up any temporary files
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
      }
    }

    // Determine appropriate status code
    const statusCode = error.message.includes("limit") ? 413 : 500;

    res
      .status(statusCode)
      .json(
        createResponse(
          false,
          {},
          `Upload failed: ${error.message || "An unknown error occurred"}`
        )
      );
  }
};

/**
 * Fetch all files for the authenticated user
 * @route GET /api/files
 * @returns {Array} List of file objects
 */
const fetchFiles = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.id;

    // Query DB for files belonging to this user
    const files = await File.findAll({
      where: { userId },
      order: [["uploaded", "DESC"]],
      // Remove explicit attributes to select all columns from the model
    });

    // Format response
    const formattedFiles = files.map((file) => ({
      id: file.id,
      name: file.originalName,
      displayName: file.originalName,
      encryptedName: file.name,
      type: file.type,
      mimeType: file.mimeType,
      size: file.size,
      uploaded: file.uploaded,
      encrypted: file.encrypted,
      downloadUrl: `/api/files/download/${file.id}`,
      previewUrl:
        file.mimeType &&
        (file.mimeType.startsWith("image/") ||
          file.mimeType === "application/pdf")
          ? `/api/files/view/${file.id}`
          : null,
    }));

    res
      .status(200)
      .json(
        createResponse(
          true,
          { files: formattedFiles },
          "Files retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching files:", error);
    res
      .status(500)
      .json(
        createResponse(
          false,
          {},
          "Failed to fetch files. Please try again later."
        )
      );
  }
};

/**
 * View/Download a file by ID
 * @route GET /api/files/view/:id
 * @param {string} id - File ID
 * @returns {File} File content with appropriate headers
 */
const viewFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    // Find the file in database
    const file = await File.findOne({
      where: {
        id: fileId,
        userId, // Ensure the file belongs to the authenticated user
      },
    });

    if (!file) {
      return res
        .status(404)
        .json(createResponse(false, {}, "File not found or access denied"));
    }

    const filepath = path.join(UPLOAD_DIR, file.name);

    if (!fs.existsSync(filepath)) {
      return res
        .status(404)
        .json(createResponse(false, {}, "File not found on server"));
    }

    // Log the file view/download activity
    await logUserActivity(
      userId,
      USER_ACTIONS.FILE_VIEW,
      TARGET_TYPES.FILE,
      {
        targetId: fileId,
        fileName: file.originalName,
        fileSize: file.size * 1024 * 1024, // Convert MB back to bytes
        details: {
          mimeType: file.mimeType,
        },
      },
      req
    );

    // Set content type based on file extension
    const ext = path.extname(file.originalName).toLowerCase();
    const contentTypes = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".pdf": "application/pdf",
      ".txt": "text/plain",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".csv": "text/csv",
      ".zip": "application/zip",
      ".rar": "application/x-rar-compressed",
      ".7z": "application/x-7z-compressed",
    };

    const contentType = contentTypes[ext] || "application/octet-stream";
    const isImage = contentType.startsWith("image/");
    const isPdf = contentType === "application/pdf";

    // Set appropriate headers
    res.setHeader("Content-Type", contentType);

    // For inline viewing of images and PDFs
    if (isImage || isPdf) {
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${file.originalName}"`
      );
    } else {
      // Force download for other file types
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.originalName}"`
      );
    }

    const stats = fs.statSync(filepath);

    // For very small files, use buffer approach for better performance
    if (stats.size < 5 * 1024 * 1024) {
      // 5MB threshold
      try {
        const encryptedData = fs.readFileSync(filepath);
        // Use the IV from the DB for decryption
        const fileIv = Buffer.from(file.iv, "hex");
        const decipher = crypto.createDecipheriv(
          algorithm,
          Buffer.from(secretKey, "hex"),
          fileIv
        );
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        // Set content length for progress tracking
        res.setHeader("Content-Length", decrypted.length);
        res.send(decrypted);
      } catch (decryptError) {
        console.error("Decryption error:", decryptError);
        throw new Error("Failed to decrypt file");
      }
    } else {
      // Stream approach for larger files (better memory efficiency)
      try {
        // Use the IV from the DB for decryption
        const fileIv = Buffer.from(file.iv, "hex");
        const decipher = crypto.createDecipheriv(
          algorithm,
          Buffer.from(secretKey, "hex"),
          fileIv
        );
        const input = fs.createReadStream(filepath);

        // Set content length for progress tracking
        res.setHeader("Content-Length", stats.size);

        // Error handling
        input.on("error", (err) => {
          console.error("Input stream error:", err);
          if (!res.headersSent) res.status(500).end();
        });

        decipher.on("error", (err) => {
          console.error("Decipher error:", err);
          if (!res.headersSent) res.status(500).end();
        });

        // Cleanup on connection close
        res.on("close", () => {
          input.destroy();
          decipher.destroy();
        });

        // Stream the decrypted file
        input.pipe(decipher).pipe(res);
      } catch (streamError) {
        console.error("Stream setup error:", streamError);
        throw new Error("Failed to stream file");
      }
    }
  } catch (err) {
    console.error("View error:", err);
    if (!res.headersSent) {
      res
        .status(500)
        .json(
          createResponse(false, {}, `Error processing file: ${err.message}`)
        );
    }
  }
};

/**
 * Delete a file by ID
 * @route DELETE /api/files/:id
 * @param {string} id - File ID to delete
 * @returns {Object} Status of the operation
 */
const deleteFile = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const fileId = req.params.id;
    const userId = req.user.id;

    // Validate file ID
    if (!fileId || isNaN(fileId)) {
      return res.status(400).json(createResponse(false, {}, "Invalid file ID"));
    }

    // Find the file with transaction
    const file = await File.findOne({
      where: {
        id: fileId,
        userId, // Ensure the file belongs to the authenticated user
      },
      transaction,
    });

    if (!file) {
      await transaction.rollback();
      return res
        .status(404)
        .json(createResponse(false, {}, "File not found or access denied"));
    }

    const filePath = path.join(UPLOAD_DIR, file.name);
    let fileDeleted = false;

    // Delete the physical file
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        fileDeleted = true;
      }
    } catch (deleteError) {
      console.error(
        `Error deleting file from filesystem: ${deleteError.message}`
      );
      await transaction.rollback();
      return res
        .status(500)
        .json(createResponse(false, {}, "Failed to delete physical file"));
    }

    // Delete the database record
    await file.destroy({ transaction });
    await transaction.commit();

    // Log the file deletion activity
    await logUserActivity(
      userId,
      USER_ACTIONS.FILE_DELETE,
      TARGET_TYPES.FILE,
      {
        targetId: fileId,
        fileName: file.originalName,
        fileSize: file.size * 1024 * 1024, // Convert MB back to bytes
        details: {
          mimeType: file.mimeType,
        },
      },
      req
    );

    res.json(
      createResponse(
        true,
        {
          fileId: file.id,
          filename: file.originalName,
          deletedAt: new Date().toISOString(),
        },
        "File deleted successfully"
      )
    );
  } catch (error) {
    await transaction.rollback();

    console.error("Delete file error:", error);
    const statusCode = error.name === "SequelizeValidationError" ? 400 : 500;

    if (!res.headersSent) {
      res
        .status(statusCode)
        .json(
          createResponse(false, {}, error.message || "Failed to delete file")
        );
    }
  }
};

// Error handling middleware for file uploads
const handleFileUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(413)
        .json(
          createResponse(
            false,
            {},
            `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`
          )
        );
    } else if (err.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json(
          createResponse(
            false,
            {},
            "Too many files. Only one file at a time is allowed"
          )
        );
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(400)
        .json(createResponse(false, {}, "Unexpected field in file upload"));
    }
  } else if (err) {
    // Other errors
    return res
      .status(400)
      .json(createResponse(false, {}, err.message || "File upload failed"));
  }

  // No errors, proceed to next middleware
  next();
};

export {
  upload,
  uploadFile,
  fetchFiles,
  viewFile,
  deleteFile,
  handleFileUploadErrors,
};

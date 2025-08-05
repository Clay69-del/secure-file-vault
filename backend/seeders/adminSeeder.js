import bcrypt from "bcryptjs";
import { User, SystemSettings } from "../models/index.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Create default admin user and system settings
 */
const createDefaultAdmin = async () => {
  try {
    console.log("🚀 Starting admin seeder...");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { role: "super_admin" },
    });

    if (existingAdmin) {
      console.log("✅ Super admin user already exists:", existingAdmin.email);
    } else {
      // Create default super admin user
      const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || "admin123456";
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const adminUser = await User.create({
        name: "System Administrator",
        email: process.env.ADMIN_EMAIL || "admin@securefilevault.com",
        password: hashedPassword,
        role: "super_admin",
        status: "active",
        lastLoginAt: null,
        loginAttempts: 0,
        lockedUntil: null,
      });

      console.log("✅ Super admin user created:");
      console.log("   Email:", adminUser.email);
      console.log("   Password:", adminPassword);
      console.log(
        "   ⚠️  IMPORTANT: Please change the default password after first login!"
      );
    }

    // Create default system settings
    const defaultSettings = [
      {
        key: "maintenance_mode",
        value: false,
        description: "Enable/disable maintenance mode",
        category: "system",
        dataType: "boolean",
        isPublic: true,
      },
      {
        key: "max_file_size",
        value: 52428800, // 50MB in bytes
        description: "Maximum file size allowed for upload",
        category: "storage",
        dataType: "number",
        isPublic: false,
      },
      {
        key: "allowed_file_types",
        value: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/pdf",
          "text/plain",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        description: "List of allowed file MIME types",
        category: "security",
        dataType: "json",
        isPublic: false,
      },
      {
        key: "max_login_attempts",
        value: 5,
        description: "Maximum failed login attempts before account lockout",
        category: "security",
        dataType: "number",
        isPublic: false,
      },
      {
        key: "lockout_duration",
        value: 900, // 15 minutes in seconds
        description: "Account lockout duration in seconds",
        category: "security",
        dataType: "number",
        isPublic: false,
      },
      {
        key: "session_timeout",
        value: 86400, // 24 hours in seconds
        description: "User session timeout in seconds",
        category: "security",
        dataType: "number",
        isPublic: false,
      },
      {
        key: "enable_registration",
        value: true,
        description: "Allow new user registrations",
        category: "system",
        dataType: "boolean",
        isPublic: true,
      },
      {
        key: "app_name",
        value: "Secure File Vault",
        description: "Application name",
        category: "ui",
        dataType: "string",
        isPublic: true,
      },
      {
        key: "app_description",
        value: "Secure file storage and sharing platform",
        description: "Application description",
        category: "ui",
        dataType: "string",
        isPublic: true,
      },
      {
        key: "contact_email",
        value: "support@securefilevault.com",
        description: "Contact email for support",
        category: "ui",
        dataType: "string",
        isPublic: true,
      },
    ];

    // Create or update system settings
    for (const setting of defaultSettings) {
      const [settingRecord, created] = await SystemSettings.findOrCreate({
        where: { key: setting.key },
        defaults: setting,
      });

      if (created) {
        console.log(`✅ Created system setting: ${setting.key}`);
      } else {
        console.log(`ℹ️  System setting already exists: ${setting.key}`);
      }
    }

    console.log("🎉 Admin seeder completed successfully!");
    console.log("");
    console.log("📋 Next steps:");
    console.log("1. Start the server");
    console.log("2. Visit /admin to access the admin panel");
    console.log("3. Login with the admin credentials above");
    console.log("4. Change the default admin password");
    console.log("");
  } catch (error) {
    console.error("❌ Admin seeder failed:", error);
    throw error;
  }
};

/**
 * Run seeder if called directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  createDefaultAdmin()
    .then(() => {
      console.log("Seeder completed, exiting...");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeder failed:", error);
      process.exit(1);
    });
}

export default createDefaultAdmin;

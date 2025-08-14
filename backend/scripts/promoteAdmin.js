import { User } from "../models/index.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/emailService.js";

dotenv.config();

/**
 * Create or promote a user to admin
 */
const promoteToAdmin = async (email, makeSuper = false) => {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    let user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("❌ User not found. Creating new admin user...");

      // Create new admin user
      const password = "admin123456"; // Default password
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(20).toString("hex");
      const verificationTokenExpires = Date.now() + 3600000; // 1 hour from now

      user = await User.create({
        name: "Admin User",
        email: email,
        password: hashedPassword,
        role: makeSuper ? "super_admin" : "admin",
        status: "active",
        emailVerified: false,
        verificationToken,
        verificationTokenExpires,
      });

      console.log("✅ New admin user created:");
      console.log("   Email:", user.email);
      console.log("   Password:", password);
      console.log("   Role:", user.role);

      await sendVerificationEmail(user.email, verificationToken);
      console.log("📧 Verification email sent to new admin.");
    } else {
      console.log(`✅ User found: ${user.name} (${user.email})`);
      console.log(`   Current role: ${user.role}`);

      // Update existing user to admin
      await user.update({
        role: makeSuper ? "super_admin" : "admin",
        status: "active",
      });

      console.log(`✅ User promoted to ${user.role}`);
    }

    console.log("");
    console.log("🎉 Admin promotion completed!");
    console.log(
      "📝 You can now access the admin panel at: http://localhost:5173/admin"
    );
  } catch (error) {
    console.error("❌ Error promoting user to admin:", error);
    throw error;
  }
};

// Get email from command line arguments or use default
const email = process.argv[2] || "translatroyogendra@gmail.com";
const makeSuper = process.argv.includes("--super");

console.log("🚀 Starting admin promotion...");
console.log(`📧 Target email: ${email}`);
console.log(`🔐 Super admin: ${makeSuper ? "Yes" : "No"}`);
console.log("");

promoteToAdmin(email, makeSuper)
  .then(() => {
    console.log("Promotion completed, exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Promotion failed:", error);
    process.exit(1);
  });


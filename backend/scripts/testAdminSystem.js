import { User } from "../models/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Test admin authentication and role system
 */
const testAdminSystem = async () => {
  try {
    console.log("🧪 Testing Admin System...\n");

    // 1. Find admin user
    const adminUser = await User.findOne({
      where: { email: "admin@securefilevault.com" },
    });

    if (!adminUser) {
      console.log("❌ Admin user not found!");
      return;
    }

    console.log("✅ Admin user found:");
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Status: ${adminUser.status}`);
    console.log("");

    // 2. Generate JWT token for admin
    const token = jwt.sign(
      {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✅ JWT Token generated:");
    console.log(`   Token: ${token.substring(0, 50)}...`);
    console.log("");

    // 3. Test token verification
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verification successful:");
      console.log(`   User ID: ${decoded.id}`);
      console.log(`   Role: ${decoded.role}`);
      console.log("");
    } catch (tokenError) {
      console.log("❌ Token verification failed:", tokenError.message);
      return;
    }

    // 4. Test admin role check
    const hasAdminRole = ["admin", "super_admin"].includes(adminUser.role);
    console.log(`✅ Admin role check: ${hasAdminRole ? "PASSED" : "FAILED"}`);
    console.log("");

    // 5. Show example curl command for testing API
    console.log("🌐 Test the admin API with this curl command:");
    console.log(
      `curl -X GET "http://localhost:5000/api/admin/dashboard/stats" \\`
    );
    console.log(`     -H "Authorization: Bearer ${token}" \\`);
    console.log(`     -H "Content-Type: application/json"`);
    console.log("");

    // 6. Count total users and files
    const userCount = await User.count();
    console.log("📊 Database stats:");
    console.log(`   Total users: ${userCount}`);
    console.log("");

    console.log("🎉 Admin system test completed successfully!");
    console.log("💡 You can now:");
    console.log(
      "   1. Login to frontend with admin@securefilevault.com / admin123456"
    );
    console.log("   2. Navigate to http://localhost:5173/admin");
    console.log("   3. Test admin dashboard functionality");
  } catch (error) {
    console.error("❌ Admin system test failed:", error);
    throw error;
  }
};

testAdminSystem()
  .then(() => {
    console.log("\nTest completed, exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });

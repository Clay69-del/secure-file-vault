import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

import UserModel from "./User.js";
import FileModel from "./File.js";
import AdminLogModel from "./AdminLog.js";
import SystemSettingsModel from "./SystemSettings.js";
import LoginAttemptModel from "./LoginAttempt.js";
import UserActivityModel from "./UserActivity.js";

const User = UserModel(sequelize);
const File = FileModel(sequelize);
const AdminLog = AdminLogModel(sequelize);
const SystemSettings = SystemSettingsModel(sequelize);
const LoginAttempt = LoginAttemptModel(sequelize);
const UserActivity = UserActivityModel(sequelize);

// Existing associations
User.hasMany(File, { foreignKey: "userId" });
File.belongsTo(User, { foreignKey: "userId" });

// New admin-related associations
User.hasMany(AdminLog, { foreignKey: "adminId", as: "adminActions" });
AdminLog.belongsTo(User, { foreignKey: "adminId", as: "admin" });

User.hasMany(SystemSettings, {
  foreignKey: "lastModifiedBy",
  as: "modifiedSettings",
});
SystemSettings.belongsTo(User, {
  foreignKey: "lastModifiedBy",
  as: "modifier",
});

User.hasMany(LoginAttempt, { foreignKey: "userId", as: "loginHistory" });
LoginAttempt.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(UserActivity, { foreignKey: "userId", as: "activities" });
UserActivity.belongsTo(User, { foreignKey: "userId", as: "user" });

export {
  sequelize,
  User,
  File,
  AdminLog,
  SystemSettings,
  LoginAttempt,
  UserActivity,
};

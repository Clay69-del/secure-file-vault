import { sequelize } from "../config/db.js";

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
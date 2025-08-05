import { DataTypes } from "sequelize";

export default (sequelize) => {
  const AdminLog = sequelize.define(
    "AdminLog",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Action performed (e.g., "USER_SUSPENDED", "FILE_DELETED")',
      },
      targetType: {
        type: DataTypes.ENUM("user", "file", "system", "settings"),
        allowNull: false,
      },
      targetId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "ID of the target entity (user ID, file ID, etc.)",
      },
      details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Additional details about the action",
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      severity: {
        type: DataTypes.ENUM("low", "medium", "high", "critical"),
        allowNull: false,
        defaultValue: "medium",
      },
    },
    {
      tableName: "admin_logs",
      timestamps: true,
      indexes: [
        {
          fields: ["adminId"],
        },
        {
          fields: ["action"],
        },
        {
          fields: ["targetType", "targetId"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    }
  );

  return AdminLog;
};

import { DataTypes } from "sequelize";

export default (sequelize) => {
  const UserActivity = sequelize.define(
    "UserActivity",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
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
        comment:
          'Action performed (e.g., "UPLOAD", "DOWNLOAD", "DELETE", "VIEW", "LOGIN")',
      },
      targetType: {
        type: DataTypes.ENUM("file", "profile", "system"),
        allowNull: false,
      },
      targetId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "ID of the target entity (file ID, profile, etc.)",
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Name of the file involved in the action (if applicable)",
      },
      fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true,
        comment: "Size of the file in bytes (if applicable)",
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
    },
    {
      tableName: "user_activities",
      timestamps: true,
      indexes: [
        {
          fields: ["userId"],
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
        {
          fields: ["userId", "createdAt"],
        },
      ],
    }
  );

  return UserActivity;
};

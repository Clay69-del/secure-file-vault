import { DataTypes } from "sequelize";

export default (sequelize) => {
  const LoginAttempt = sequelize.define(
    "LoginAttempt",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Email used in login attempt",
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      success: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      failureReason: {
        type: DataTypes.STRING,
        allowNull: true,
        comment:
          'Reason for failure (e.g., "invalid_credentials", "account_locked")',
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        comment: "Associated user ID if user exists",
      },
      loginMethod: {
        type: DataTypes.ENUM("email", "google", "admin"),
        allowNull: false,
        defaultValue: "email",
      },
      location: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Geolocation data if available",
      },
      sessionId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Session ID for successful logins",
      },
    },
    {
      tableName: "login_attempts",
      timestamps: true,
      indexes: [
        {
          fields: ["email"],
        },
        {
          fields: ["ipAddress"],
        },
        {
          fields: ["success"],
        },
        {
          fields: ["userId"],
        },
        {
          fields: ["createdAt"],
        },
      ],
    }
  );

  return LoginAttempt;
};

import { DataTypes } from "sequelize";

export default (sequelize) => {
  const SystemSettings = sequelize.define(
    "SystemSettings",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'Setting key (e.g., "maintenance_mode", "max_file_size")',
      },
      value: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Setting value (can be string, number, boolean, object)",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Human-readable description of the setting",
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "general",
        comment:
          'Category for grouping settings (e.g., "security", "storage", "ui")',
      },
      dataType: {
        type: DataTypes.ENUM("string", "number", "boolean", "json"),
        allowNull: false,
        defaultValue: "string",
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Whether this setting can be accessed by non-admin users",
      },
      lastModifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "system_settings",
      timestamps: true,
      indexes: [
        {
          fields: ["key"],
          unique: true,
        },
        {
          fields: ["category"],
        },
        {
          fields: ["isPublic"],
        },
      ],
    }
  );

  return SystemSettings;
};

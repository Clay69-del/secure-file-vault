import { SystemSettings, AdminLog } from "../models/index.js";
import {
  logAdminAction,
  AUDIT_ACTIONS,
  AUDIT_SEVERITY,
} from "../middleware/auditLogger.js";

/**
 * Get all system settings
 */
export const getAllSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.findAll({
      order: [
        ["category", "ASC"],
        ["key", "ASC"],
      ],
    });

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        key: setting.key,
        value: setting.value,
        description: setting.description,
        type: setting.type,
        updatedAt: setting.updatedAt,
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedSettings,
    });

    // Log this action
    await logAdminAction(
      req,
      AUDIT_ACTIONS.SETTINGS_VIEWED,
      "system",
      {},
      {
        severity: AUDIT_SEVERITY.LOW,
      }
    );
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch system settings",
    });
  }
};

/**
 * Update system settings
 */
export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({
        success: false,
        error: "Settings array is required",
      });
    }

    const updatedSettings = [];
    const changes = [];

    for (const settingUpdate of settings) {
      const { key, value } = settingUpdate;

      if (!key || value === undefined) {
        continue;
      }

      const setting = await SystemSettings.findOne({ where: { key } });

      if (setting) {
        const oldValue = setting.value;
        await setting.update({ value: value.toString() });
        updatedSettings.push(setting);

        if (oldValue !== value.toString()) {
          changes.push({
            key,
            from: oldValue,
            to: value.toString(),
          });
        }
      }
    }

    res.json({
      success: true,
      message: `Updated ${updatedSettings.length} settings`,
      data: updatedSettings,
    });

    // Log this action with changes
    await logAdminAction(
      req,
      AUDIT_ACTIONS.SETTINGS_UPDATED,
      "system",
      {},
      {
        details: { changes },
        severity: AUDIT_SEVERITY.HIGH,
      }
    );
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update system settings",
    });
  }
};

/**
 * Get specific setting by key
 */
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await SystemSettings.findOne({ where: { key } });

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: "Setting not found",
      });
    }

    res.json({
      success: true,
      data: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
        type: setting.type,
        category: setting.category,
      },
    });
  } catch (error) {
    console.error("Get setting error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch setting",
    });
  }
};

/**
 * Update specific setting
 */
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: "Value is required",
      });
    }

    const setting = await SystemSettings.findOne({ where: { key } });

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: "Setting not found",
      });
    }

    const oldValue = setting.value;
    await setting.update({ value: value.toString() });

    res.json({
      success: true,
      message: "Setting updated successfully",
      data: {
        key: setting.key,
        value: setting.value,
        oldValue,
      },
    });

    // Log this action
    await logAdminAction(
      req,
      AUDIT_ACTIONS.SETTINGS_UPDATED,
      "system",
      {},
      {
        targetId: key,
        details: { key, from: oldValue, to: value.toString() },
        severity: AUDIT_SEVERITY.MEDIUM,
      }
    );
  } catch (error) {
    console.error("Update setting error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update setting",
    });
  }
};

/**
 * Reset settings to default
 */
export const resetToDefaults = async (req, res) => {
  try {
    const { category } = req.body;

    // Default settings
    const defaultSettings = [
      {
        key: "site_name",
        value: "Secure File Vault",
        category: "general",
        description: "Site name",
        type: "string",
      },
      {
        key: "max_file_size",
        value: "100",
        category: "uploads",
        description: "Maximum file size in MB",
        type: "number",
      },
      {
        key: "allowed_file_types",
        value: "pdf,doc,docx,jpg,jpeg,png,gif,zip,rar",
        category: "uploads",
        description: "Allowed file extensions",
        type: "string",
      },
      {
        key: "user_storage_limit",
        value: "1000",
        category: "storage",
        description: "User storage limit in MB",
        type: "number",
      },
      {
        key: "enable_registration",
        value: "true",
        category: "security",
        description: "Allow new user registration",
        type: "boolean",
      },
      {
        key: "require_email_verification",
        value: "true",
        category: "security",
        description: "Require email verification",
        type: "boolean",
      },
      {
        key: "session_timeout",
        value: "24",
        category: "security",
        description: "Session timeout in hours",
        type: "number",
      },
      {
        key: "max_login_attempts",
        value: "5",
        category: "security",
        description: "Maximum login attempts before lockout",
        type: "number",
      },
    ];

    let settingsToReset = defaultSettings;
    if (category) {
      settingsToReset = defaultSettings.filter((s) => s.category === category);
    }

    const resetCount = await Promise.all(
      settingsToReset.map(async (defaultSetting) => {
        const [setting] = await SystemSettings.findOrCreate({
          where: { key: defaultSetting.key },
          defaults: defaultSetting,
        });

        if (!setting.dataValues.key) {
          // New record created
          return setting;
        } else {
          // Update existing record to default
          return await setting.update({
            value: defaultSetting.value,
            description: defaultSetting.description,
            type: defaultSetting.type,
            category: defaultSetting.category,
          });
        }
      })
    );

    res.json({
      success: true,
      message: `Reset ${resetCount.length} settings to default`,
      data: resetCount,
    });

    // Log this action
    await logAdminAction(
      req,
      "SETTINGS_RESET",
      "system",
      {},
      {
        details: { category: category || "all", count: resetCount.length },
        severity: AUDIT_SEVERITY.HIGH,
      }
    );
  } catch (error) {
    console.error("Reset settings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset settings",
    });
  }
};

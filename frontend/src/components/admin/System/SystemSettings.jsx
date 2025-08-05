import React, { useState, useEffect } from "react";
import { adminApi, handleAdminApiError } from "../../../utils/adminApi";
import { useAdmin } from "../../../context/AdminContext";
import {
  FiSettings,
  FiSave,
  FiRotateCcw,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheck,
  FiShield,
  FiUpload,
  FiHardDrive,
  FiGlobe,
} from "react-icons/fi";

const SystemSettings = () => {
  const { isSuperAdmin } = useAdmin();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [changedSettings, setChangedSettings] = useState({});

  const fetchSettings = async () => {
    try {
      setError(null);
      const response = await adminApi.settings.getAll();
      setSettings(response.data.data || {});
    } catch (err) {
      console.error("Settings fetch error:", err);
      setError(handleAdminApiError(err, "Failed to load settings"));

      // Set fallback settings to prevent component from breaking
      setSettings({
        general: {
          siteName: "Secure File Vault",
          siteDescription: "Secure File Sharing Platform",
          maintenanceMode: false,
          enableRegistrations: true,
        },
        security: {
          maxLoginAttempts: 5,
          passwordMinLength: 8,
          requireTwoFactor: false,
          sessionTimeout: 3600,
        },
        storage: {
          maxFileSize: "100MB",
          allowedFileTypes: "pdf,doc,docx,txt,jpg,png,gif",
          storageQuotaPerUser: "10GB",
          enableEncryption: true,
        },
        email: {
          smtpHost: "",
          smtpPort: 587,
          smtpUsername: "",
          enableEmailNotifications: false,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    const settingKey = `${category}.${key}`;
    setChangedSettings((prev) => ({
      ...prev,
      [settingKey]: { key, value, category },
    }));
  };

  const handleSave = async () => {
    if (!isSuperAdmin) {
      setError("Only super administrators can modify settings");
      return;
    }

    setSaving(true);
    try {
      const settingsArray = Object.values(changedSettings);
      await adminApi.settings.update(settingsArray);
      setSuccess("Settings updated successfully");
      setChangedSettings({});
      await fetchSettings();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Settings save error:", err);
      setError(handleAdminApiError(err, "Failed to save settings"));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (category) => {
    if (!isSuperAdmin) {
      setError("Only super administrators can reset settings");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to reset all ${category} settings to defaults?`
      )
    ) {
      return;
    }

    try {
      await adminApi.settings.resetToDefaults(category);
      setSuccess(`${category} settings reset to defaults`);
      await fetchSettings();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Settings reset error:", err);
      setError(handleAdminApiError(err, "Failed to reset settings"));
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="rounded-lg bg-yellow-50 p-6">
        <div className="flex">
          <FiShield className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Access Restricted
            </h3>
            <p className="mt-2 text-sm text-yellow-700">
              Only super administrators can view and modify system settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const categoryIcons = {
    general: FiGlobe,
    security: FiShield,
    uploads: FiUpload,
    storage: FiHardDrive,
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: "blue",
      security: "red",
      uploads: "green",
      storage: "orange",
    };
    return colors[category] || "gray";
  };

  const renderSettingInput = (category, key, setting) => {
    const currentValue =
      changedSettings[`${category}.${key}`]?.value ?? setting.value;
    const settingKey = `${category}.${key}`;

    switch (setting.type) {
      case "boolean":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={settingKey}
              checked={currentValue === "true"}
              onChange={(e) =>
                handleSettingChange(category, key, e.target.checked.toString())
              }
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor={settingKey} className="ml-2 text-sm text-gray-700">
              {setting.description}
            </label>
          </div>
        );

      case "number":
        return (
          <div>
            <label
              htmlFor={settingKey}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {setting.description}
            </label>
            <input
              type="number"
              id={settingKey}
              value={currentValue}
              onChange={(e) =>
                handleSettingChange(category, key, e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );

      default:
        return (
          <div>
            <label
              htmlFor={settingKey}
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {setting.description}
            </label>
            <input
              type="text"
              id={settingKey}
              value={currentValue}
              onChange={(e) =>
                handleSettingChange(category, key, e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchSettings}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {Object.keys(changedSettings).length > 0 && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <FiSave className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <div className="flex">
            <FiAlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-4">
          <div className="flex">
            <FiCheck className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Changed Settings Warning */}
      {Object.keys(changedSettings).length > 0 && (
        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex">
            <FiAlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                You have {Object.keys(changedSettings).length} unsaved changes.
                Don't forget to save your changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(settings).map(([category, categorySettings]) => {
          const CategoryIcon = categoryIcons[category] || FiSettings;
          const color = getCategoryColor(category);

          return (
            <div
              key={category}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${color}-100`}>
                      <CategoryIcon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-median text-gray-900 capitalize">
                        {category} Settings
                      </h3>
                      <p className="text-sm text-gray-500">
                        {categorySettings.length} settings
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleReset(category)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                    title="Reset to defaults"
                  >
                    <FiRotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {categorySettings.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {setting.key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </h4>
                      {changedSettings[`${category}.${setting.key}`] && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Modified
                        </span>
                      )}
                    </div>
                    {renderSettingInput(category, setting.key, setting)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex">
          <FiSettings className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Settings Help</h3>
            <div className="mt-2 text-sm text-blue-700 space-y-1">
              <p>
                • Changes are saved immediately when you click "Save Changes"
              </p>
              <p>• Use "Reset" to restore category defaults</p>
              <p>
                • Some settings may require application restart to take effect
              </p>
              <p>
                • Always test critical changes in a staging environment first
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;

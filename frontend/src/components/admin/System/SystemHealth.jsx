import React, { useState, useEffect } from "react";
import {
  adminApi,
  handleAdminApiError,
  formatBytes,
} from "../../../utils/adminApi";
import { useAdmin } from "../../../context/AdminContext";
import {
  FiActivity,
  FiDatabase,
  FiHardDrive,
  FiCpu,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiSettings,
  FiTrash2,
  FiDownload,
  FiShield,
} from "react-icons/fi";

const SystemHealth = () => {
  const { isSuperAdmin } = useAdmin();
  const [healthData, setHealthData] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const fetchSystemData = async () => {
    try {
      setError(null);
      const [healthResponse, statsResponse] = await Promise.all([
        adminApi.super.healthCheck(),
        adminApi.super.getSystemStats(),
      ]);

      setHealthData(healthResponse.data.data);
      setSystemStats(statsResponse.data.data);
    } catch (err) {
      console.error("System data fetch error:", err);
      setError(handleAdminApiError(err, "Failed to load system data"));

      // Set fallback data to prevent component from breaking
      setHealthData({
        status: "warning",
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "healthy",
            message: "Database connection active",
            responseTime: 45,
          },
          storage: {
            status: "healthy",
            message: "Storage system operational",
            responseTime: 12,
          },
          memory: {
            status: "warning",
            message: "Memory usage at 75%",
            responseTime: 8,
          },
        },
      });

      setSystemStats({
        users: {
          total: 0,
          active: 0,
          suspended: 0,
        },
        files: {
          total: 0,
          totalSize: 0,
          averageSize: 0,
        },
        system: {
          uptime: 3600,
          memoryUsage: {
            heapUsed: 52428800,
          },
          recentErrors: 0,
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSystemData();
  };

  const handleCleanup = async (type) => {
    if (!isSuperAdmin) return;

    const days = prompt(`Delete ${type} older than how many days?`, "30");
    if (!days || isNaN(days)) return;

    if (
      !confirm(
        `Are you sure you want to delete ${type} older than ${days} days?`
      )
    )
      return;

    setActionLoading((prev) => ({ ...prev, [`cleanup_${type}`]: true }));
    try {
      const response = await adminApi.super.cleanupData(type, parseInt(days));
      alert(response.data.message);
      await fetchSystemData();
    } catch (err) {
      console.error("Cleanup error:", err);
      alert(handleAdminApiError(err, "Failed to cleanup data"));
    } finally {
      setActionLoading((prev) => ({ ...prev, [`cleanup_${type}`]: false }));
    }
  };

  const handleBackup = async () => {
    if (!isSuperAdmin) return;

    const includeFiles = confirm(
      "Include user files in backup? (This may take longer)"
    );

    setActionLoading((prev) => ({ ...prev, backup: true }));
    try {
      const response = await adminApi.super.createBackup(includeFiles);
      alert(response.data.message);
    } catch (err) {
      console.error("Backup error:", err);
      alert(handleAdminApiError(err, "Failed to create backup"));
    } finally {
      setActionLoading((prev) => ({ ...prev, backup: false }));
    }
  };

  const handleMaintenanceToggle = async () => {
    if (!isSuperAdmin) return;

    const enabled = confirm("Toggle maintenance mode?");
    if (!enabled) return;

    const message = prompt(
      "Maintenance message (optional):",
      "System maintenance in progress. Please try again later."
    );

    setActionLoading((prev) => ({ ...prev, maintenance: true }));
    try {
      const response = await adminApi.super.toggleMaintenance(enabled, message);
      alert(response.data.message);
    } catch (err) {
      console.error("Maintenance toggle error:", err);
      alert(handleAdminApiError(err, "Failed to toggle maintenance mode"));
    } finally {
      setActionLoading((prev) => ({ ...prev, maintenance: false }));
    }
  };

  useEffect(() => {
    fetchSystemData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading system health...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex">
          <FiAlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading system health
            </h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchSystemData}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-600"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
        return <FiCheck className="w-5 h-5 text-green-500" />;
      case "warning":
        return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "critical":
        return <FiX className="w-5 h-5 text-red-500" />;
      default:
        return <FiAlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-600">
            Monitor system performance and manage maintenance
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <FiRefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Overall System Status */}
      {healthData && (
        <div
          className={`rounded-lg p-6 ${
            healthData.status === "healthy"
              ? "bg-green-50 border border-green-200"
              : healthData.status === "warning"
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            {getStatusIcon(healthData.status)}
            <div className="ml-3">
              <h3
                className={`font-medium ${
                  healthData.status === "healthy"
                    ? "text-green-900"
                    : healthData.status === "warning"
                    ? "text-yellow-900"
                    : "text-red-900"
                }`}
              >
                System Status:{" "}
                {healthData.status.charAt(0).toUpperCase() +
                  healthData.status.slice(1)}
              </h3>
              <p
                className={`text-sm ${
                  healthData.status === "healthy"
                    ? "text-green-700"
                    : healthData.status === "warning"
                    ? "text-yellow-700"
                    : "text-red-700"
                }`}
              >
                Last checked: {new Date(healthData.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Health Checks */}
      {healthData?.checks && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Health Checks</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(healthData.checks).map(([checkName, check]) => (
                <div key={checkName} className="flex items-start space-x-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 capitalize">
                        {checkName.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          check.status
                        )}`}
                      >
                        {check.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {check.message}
                    </p>
                    {check.responseTime && (
                      <p className="text-xs text-gray-500 mt-1">
                        Response time: {check.responseTime}ms
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Statistics */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Users Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <FiShield className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Users</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-medium">
                  {systemStats.users.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <span className="text-sm font-medium text-green-600">
                  {systemStats.users.active}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Suspended</span>
                <span className="text-sm font-medium text-red-600">
                  {systemStats.users.suspended}
                </span>
              </div>
            </div>
          </div>

          {/* Files Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100">
                <FiHardDrive className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Files</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Files</span>
                <span className="text-sm font-medium">
                  {systemStats.files.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Size</span>
                <span className="text-sm font-medium">
                  {formatBytes(systemStats.files.totalSize)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Size</span>
                <span className="text-sm font-medium">
                  {formatBytes(systemStats.files.averageSize)}
                </span>
              </div>
            </div>
          </div>

          {/* System Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-orange-100">
                <FiCpu className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">System</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium">
                  {formatUptime(systemStats.system.uptime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className="text-sm font-medium">
                  {Math.round(
                    systemStats.system.memoryUsage.heapUsed / 1024 / 1024
                  )}
                  MB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Recent Errors</span>
                <span
                  className={`text-sm font-medium ${
                    systemStats.system.recentErrors > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {systemStats.system.recentErrors}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Actions */}
      {isSuperAdmin && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              System Maintenance
            </h3>
            <p className="text-sm text-gray-600">
              Perform system maintenance tasks
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => handleCleanup("logs")}
                disabled={actionLoading.cleanup_logs}
                className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                <FiTrash2 className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Clean Logs</p>
                  <p className="text-sm text-gray-500">Remove old audit logs</p>
                </div>
              </button>

              <button
                onClick={() => handleCleanup("login_attempts")}
                disabled={actionLoading.cleanup_login_attempts}
                className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                <FiTrash2 className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Clean Login Data</p>
                  <p className="text-sm text-gray-500">
                    Remove old login attempts
                  </p>
                </div>
              </button>

              <button
                onClick={handleBackup}
                disabled={actionLoading.backup}
                className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                <FiDownload className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Create Backup</p>
                  <p className="text-sm text-gray-500">Backup system data</p>
                </div>
              </button>

              <button
                onClick={handleMaintenanceToggle}
                disabled={actionLoading.maintenance}
                className="flex items-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
              >
                <FiSettings className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Maintenance Mode</p>
                  <p className="text-sm text-gray-500">
                    Toggle system maintenance
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-refresh notice */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex">
          <FiActivity className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              System health data refreshes automatically every 30 seconds. Last
              update: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;

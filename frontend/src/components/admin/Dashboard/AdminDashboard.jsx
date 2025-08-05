import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  adminApi,
  formatBytes,
  formatAdminDate,
  handleAdminApiError,
} from "../../../utils/adminApi";
import {
  FiUsers,
  FiFile,
  FiShield,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [statsResponse, activityResponse, healthResponse] =
        await Promise.all([
          adminApi.dashboard.getStats(),
          adminApi.dashboard.getActivity(10),
          adminApi.dashboard.getHealth(),
        ]);

      setDashboardData(statsResponse.data);
      setRecentActivity(activityResponse.data);
      setSystemHealth(healthResponse.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(handleAdminApiError(err, "Failed to load dashboard data"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
              Error loading dashboard
            </h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-600"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const overview = dashboardData?.overview || {};
  const growth = dashboardData?.growth || {};
  const storage = dashboardData?.storage || {};
  const fileTypes = dashboardData?.fileTypes || [];

  // Statistics cards data
  const statsCards = [
    {
      title: "Total Users",
      value: overview.totalUsers || 0,
      change: `+${growth.weeklyUsers || 0} this week`,
      changeType: growth.userGrowthRate >= 0 ? "increase" : "decrease",
      icon: FiUsers,
      color: "blue",
      link: "/admin/users",
    },
    {
      title: "Total Files",
      value: overview.totalFiles || 0,
      change: `+${growth.weeklyFiles || 0} this week`,
      changeType: growth.fileGrowthRate >= 0 ? "increase" : "decrease",
      icon: FiFile,
      color: "green",
      link: "/admin/files",
    },
    {
      title: "Active Users",
      value: overview.activeUsers || 0,
      change: `${overview.suspendedUsers || 0} suspended`,
      changeType: "neutral",
      icon: FiActivity,
      color: "purple",
      link: "/admin/users?status=active",
    },
    {
      title: "Storage Used",
      value: storage.totalSize || "0 B",
      change: `${overview.totalFiles || 0} files`,
      changeType: "neutral",
      icon: FiShield,
      color: "orange",
      link: "/admin/files",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Monitor and manage your Secure File Vault system
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

      {/* System Health Alert */}
      {systemHealth && (
        <div
          className={`rounded-lg p-4 ${
            systemHealth.overall === "healthy"
              ? "bg-green-50 border border-green-200"
              : systemHealth.overall === "warning"
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${
                systemHealth.overall === "healthy"
                  ? "bg-green-500"
                  : systemHealth.overall === "warning"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            ></div>
            <h3
              className={`font-medium ${
                systemHealth.overall === "healthy"
                  ? "text-green-900"
                  : systemHealth.overall === "warning"
                  ? "text-yellow-900"
                  : "text-red-900"
              }`}
            >
              System Status:{" "}
              {systemHealth.overall === "healthy"
                ? "All Systems Operational"
                : systemHealth.overall === "warning"
                ? "Some Issues Detected"
                : "Critical Issues Found"}
            </h3>
            <Link
              to="/admin/system"
              className="ml-auto text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              View Details →
            </Link>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {card.value}
                </p>
                <div className="flex items-center mt-2 text-sm">
                  {card.changeType === "increase" && (
                    <FiTrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  )}
                  {card.changeType === "decrease" && (
                    <FiTrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={`${
                      card.changeType === "increase"
                        ? "text-green-600"
                        : card.changeType === "decrease"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-full ${
                  card.color === "blue"
                    ? "bg-blue-100"
                    : card.color === "green"
                    ? "bg-green-100"
                    : card.color === "purple"
                    ? "bg-purple-100"
                    : "bg-orange-100"
                }`}
              >
                <card.icon
                  className={`w-6 h-6 ${
                    card.color === "blue"
                      ? "text-blue-600"
                      : card.color === "green"
                      ? "text-green-600"
                      : card.color === "purple"
                      ? "text-purple-600"
                      : "text-orange-600"
                  }`}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column layout for activity and file types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Admin Activity
              </h3>
              <Link
                to="/admin/security/audit-logs"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentActivity?.adminActions?.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.adminActions.slice(0, 5).map((action) => (
                  <div key={action.id} className="flex items-start space-x-3">
                    <div
                      className={`p-1 rounded-full ${
                        action.severity === "critical"
                          ? "bg-red-100"
                          : action.severity === "high"
                          ? "bg-orange-100"
                          : action.severity === "medium"
                          ? "bg-yellow-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <FiActivity
                        className={`w-3 h-3 ${
                          action.severity === "critical"
                            ? "text-red-600"
                            : action.severity === "high"
                            ? "text-orange-600"
                            : action.severity === "medium"
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">
                          {action.admin?.name}
                        </span>{" "}
                        {action.action.toLowerCase().replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatAdminDate(action.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* File Types Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              File Types Distribution
            </h3>
          </div>
          <div className="p-6">
            {fileTypes.length > 0 ? (
              <div className="space-y-3">
                {fileTypes.slice(0, 6).map((fileType, index) => (
                  <div
                    key={fileType.type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          index === 0
                            ? "bg-purple-500"
                            : index === 1
                            ? "bg-blue-500"
                            : index === 2
                            ? "bg-green-500"
                            : index === 3
                            ? "bg-yellow-500"
                            : index === 4
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        {fileType.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {fileType.count}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({fileType.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No file data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {overview.todayRegistrations || 0}
            </p>
            <p className="text-sm text-gray-600">New Registrations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {overview.todayUploads || 0}
            </p>
            <p className="text-sm text-gray-600">Files Uploaded</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {overview.recentLogins || 0}
            </p>
            <p className="text-sm text-gray-600">Successful Logins</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {overview.failedLogins || 0}
            </p>
            <p className="text-sm text-gray-600">Failed Logins</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

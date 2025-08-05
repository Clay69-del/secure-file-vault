import React, { useState, useEffect } from "react";
import { adminApi, handleAdminApiError } from "../../../utils/adminApi";
import {
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiFile,
  FiShield,
  FiServer,
  FiGlobe,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
  FiClock,
  FiHardDrive,
  FiCpu,
  FiWifi,
} from "react-icons/fi";

const EnhancedAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchEnhancedAnalytics();
  }, [timeRange]);

  const fetchEnhancedAnalytics = async () => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);

      const response = await adminApi.analytics.getEnhanced(timeRange);
      setAnalyticsData(response.data.data);
    } catch (err) {
      console.error("Failed to fetch enhanced analytics:", err);
      setError(handleAdminApiError(err, "Failed to load enhanced analytics"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEnhancedAnalytics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enhanced analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <FiXCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Error Loading Analytics
          </h3>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: FiBarChart2 },
    { id: "users", label: "User Analytics", icon: FiUsers },
    { id: "files", label: "File Analytics", icon: FiFile },
    { id: "security", label: "Security", icon: FiShield },
    { id: "performance", label: "Performance", icon: FiServer },
    { id: "geographic", label: "Geographic", icon: FiGlobe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Enhanced Analytics
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights and performance metrics
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last year</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <FiRefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Period Info */}
        {analyticsData && (
          <div className="mt-4 text-sm text-gray-500">
            Period: {new Date(analyticsData.period.start).toLocaleDateString()}{" "}
            - {new Date(analyticsData.period.end).toLocaleDateString()} (
            {analyticsData.period.days} days)
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {analyticsData && (
        <div className="space-y-8">
          {activeTab === "overview" && <OverviewTab data={analyticsData} />}
          {activeTab === "users" && (
            <UserAnalyticsTab data={analyticsData.userAnalytics} />
          )}
          {activeTab === "files" && (
            <FileAnalyticsTab data={analyticsData.fileAnalytics} />
          )}
          {activeTab === "security" && (
            <SecurityTab data={analyticsData.securityAnalytics} />
          )}
          {activeTab === "performance" && (
            <PerformanceTab data={analyticsData.performanceAnalytics} />
          )}
          {activeTab === "geographic" && (
            <GeographicTab data={analyticsData.geoAnalytics} />
          )}
        </div>
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Key Metrics Cards */}
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <FiUsers className="h-8 w-8 text-blue-600" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Total Users</p>
          <p className="text-2xl font-semibold text-gray-900">
            {data.userAnalytics.summary.total}
          </p>
          <p className="text-sm text-green-600">
            +{data.userAnalytics.retentionRate}% retention
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <FiFile className="h-8 w-8 text-green-600" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Total Files</p>
          <p className="text-2xl font-semibold text-gray-900">
            {data.fileAnalytics.uploadTrends.reduce(
              (sum, day) => sum + day.uploads,
              0
            )}
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <FiShield className="h-8 w-8 text-yellow-600" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Security Status</p>
          <p className="text-2xl font-semibold text-gray-900">
            {data.securityAnalytics.adminActivity.riskLevel}
          </p>
          <p className="text-sm text-gray-600">Risk Level</p>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <FiActivity className="h-8 w-8 text-purple-600" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">System Health</p>
          <p className="text-2xl font-semibold text-gray-900">
            {data.performanceAnalytics.database.avgResponseTime}ms
          </p>
          <p className="text-sm text-gray-600">Avg Response</p>
        </div>
      </div>
    </div>
  </div>
);

// User Analytics Tab Component
const UserAnalyticsTab = ({ data }) => (
  <div className="space-y-6">
    {/* User Summary */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">User Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">
            {data.summary.total}
          </p>
          <p className="text-gray-600">Total Users</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">
            {data.summary.active}
          </p>
          <p className="text-gray-600">Active Users</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-red-600">
            {data.summary.inactive}
          </p>
          <p className="text-gray-600">Inactive Users</p>
        </div>
      </div>
    </div>

    {/* Role Distribution */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">User Roles</h3>
      <div className="space-y-3">
        {data.roleDistribution.map((role, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-700 capitalize">{role.role}</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${role.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">
                {role.count} ({role.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Status Distribution */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">User Status</h3>
      <div className="space-y-3">
        {data.statusDistribution.map((status, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-700 capitalize">{status.status}</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    status.status === "active"
                      ? "bg-green-600"
                      : status.status === "suspended"
                      ? "bg-red-600"
                      : "bg-yellow-600"
                  }`}
                  style={{ width: `${status.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">
                {status.count} ({status.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// File Analytics Tab Component
const FileAnalyticsTab = ({ data }) => (
  <div className="space-y-6">
    {/* File Types */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        File Types Distribution
      </h3>
      <div className="space-y-3">
        {data.fileTypes.slice(0, 10).map((type, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-700">{type.type}</span>
            <div className="flex items-center space-x-4">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${type.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-20 text-right">
                {type.count} ({type.percentage}%)
              </span>
              <span className="text-xs text-gray-500 w-16 text-right">
                {type.totalSizeMB}MB
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Size Categories */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        File Size Categories
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.sizeCategories.map((category, index) => (
          <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{category.count}</p>
            <p className="text-gray-600 text-sm">{category.category}</p>
            <p className="text-blue-600 text-xs">{category.percentage}%</p>
          </div>
        ))}
      </div>
    </div>

    {/* Top Uploaders */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Top Uploaders</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploads
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Size
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.topUploaders.slice(0, 10).map((uploader, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {uploader.userName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {uploader.userEmail}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {uploader.uploadCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {uploader.totalSizeMB} MB
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Security Tab Component
const SecurityTab = ({ data }) => (
  <div className="space-y-6">
    {/* Security Overview */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FiShield
            className={`h-8 w-8 ${
              data.adminActivity.riskLevel === "low"
                ? "text-green-600"
                : data.adminActivity.riskLevel === "medium"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Risk Level</p>
            <p className="text-2xl font-semibold text-gray-900 capitalize">
              {data.adminActivity.riskLevel}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FiActivity className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Admin Actions</p>
            <p className="text-2xl font-semibold text-gray-900">
              {data.adminActivity.totalActions}
            </p>
            <p className="text-sm text-red-600">
              {data.adminActivity.criticalActions} critical
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center">
          <FiAlertTriangle className="h-8 w-8 text-yellow-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">
              Suspicious Users
            </p>
            <p className="text-2xl font-semibold text-gray-900">
              {data.suspiciousActivity.suspiciousUsers}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Login Trends Chart Placeholder */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Login Success Rate
      </h3>
      <div className="space-y-2">
        {data.loginTrends.slice(-7).map((day, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{day.date}</span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-green-600">
                {day.successful} successful
              </span>
              <span className="text-sm text-red-600">{day.failed} failed</span>
              <span className="text-sm font-medium">
                {day.successRate}% success rate
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Suspicious Activity Details */}
    {data.suspiciousActivity.details.length > 0 && (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Suspicious Activity Details
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Failed Attempts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.suspiciousActivity.details.map((activity, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.totalAttempts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {activity.failedAttempts}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.successRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

// Performance Tab Component
const PerformanceTab = ({ data }) => (
  <div className="space-y-6">
    {/* System Health Overview */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <FiCpu className="h-8 w-8 text-blue-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900">
          {data.systemHealth.cpuUsage}%
        </p>
        <p className="text-gray-600">CPU Usage</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow text-center">
        <FiHardDrive className="h-8 w-8 text-green-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900">
          {data.systemHealth.memoryUsage}%
        </p>
        <p className="text-gray-600">Memory</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow text-center">
        <FiServer className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900">
          {data.systemHealth.diskUsage}%
        </p>
        <p className="text-gray-600">Disk Usage</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow text-center">
        <FiWifi className="h-8 w-8 text-purple-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-gray-900">
          {data.systemHealth.dbConnections}
        </p>
        <p className="text-gray-600">DB Connections</p>
      </div>
    </div>

    {/* Database Performance */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Database Performance
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">
            {data.database.avgResponseTime}ms
          </p>
          <p className="text-gray-600">Avg Response Time</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">
            {data.database.totalQueries}
          </p>
          <p className="text-gray-600">Total Queries</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-red-600">
            {data.database.slowQueries}
          </p>
          <p className="text-gray-600">Slow Queries</p>
        </div>
      </div>
    </div>

    {/* Performance Recommendations */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Recommendations
      </h3>
      <div className="space-y-3">
        {data.recommendations.map((rec, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 p-3 rounded-lg ${
              rec.type === "critical"
                ? "bg-red-50"
                : rec.type === "warning"
                ? "bg-yellow-50"
                : rec.type === "success"
                ? "bg-green-50"
                : "bg-blue-50"
            }`}
          >
            {rec.type === "critical" && (
              <FiXCircle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            {rec.type === "warning" && (
              <FiAlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            )}
            {rec.type === "success" && (
              <FiCheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-gray-900 capitalize">
                {rec.category}
              </p>
              <p className="text-gray-700">{rec.message}</p>
              <span
                className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                  rec.priority === "critical"
                    ? "bg-red-200 text-red-800"
                    : rec.priority === "high"
                    ? "bg-orange-200 text-orange-800"
                    : rec.priority === "medium"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-green-200 text-green-800"
                }`}
              >
                {rec.priority} priority
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Geographic Tab Component
const GeographicTab = ({ data }) => (
  <div className="space-y-6">
    {/* Geographic Summary */}
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Geographic Distribution
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">
            {data.summary.totalCountries}
          </p>
          <p className="text-gray-600">Countries</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">
            {data.summary.topCountry.country}
          </p>
          <p className="text-gray-600">Top Country</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-600">
            {data.summary.topCountry.users}
          </p>
          <p className="text-gray-600">Users in Top Country</p>
        </div>
      </div>

      {/* Country Distribution */}
      <div className="space-y-3">
        {data.countries.map((country, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-700">{country.country}</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${country.percentage}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 w-20 text-right">
                {country.users} ({country.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default EnhancedAnalytics;

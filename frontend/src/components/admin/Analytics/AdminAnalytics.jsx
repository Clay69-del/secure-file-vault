import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, handleAdminApiError } from "../../../utils/adminApi";
import {
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiFile,
  FiDownload,
  FiUpload,
  FiCalendar,
  FiRefreshCw,
  FiActivity,
} from "react-icons/fi";

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      if (!refreshing) setLoading(true);

      const response = await adminApi.analytics.getData(timeRange);
      setAnalyticsData(response.data.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError(handleAdminApiError(err, "Failed to load analytics data"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getPercentageColor = (percentage) => {
    return percentage >= 0 ? "text-green-600" : "text-red-600";
  };

  const getPercentageIcon = (percentage) => {
    return percentage >= 0 ? (
      <FiTrendingUp className="w-4 h-4" />
    ) : (
      <FiTrendingUp className="w-4 h-4 rotate-180" />
    );
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg font-medium">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <FiBarChart2 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to Load Analytics
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">
            Platform usage and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Enhanced Analytics Button */}
          <button
            onClick={() => navigate("/admin/analytics/enhanced")}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            <FiActivity className="w-4 h-4" />
            <span>Enhanced Analytics</span>
          </button>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                User Growth
              </h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(analyticsData.userGrowth.current)}
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`flex items-center space-x-1 text-sm font-medium ${getPercentageColor(
                  analyticsData.userGrowth.percentage
                )}`}
              >
                {getPercentageIcon(analyticsData.userGrowth.percentage)}
                <span>{Math.abs(analyticsData.userGrowth.percentage)}%</span>
              </span>
              <span className="text-sm text-gray-600">from last period</span>
            </div>
          </div>
        </div>

        {/* File Uploads */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiUpload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                File Uploads
              </h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">
              {formatNumber(analyticsData.fileUploads.current)}
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`flex items-center space-x-1 text-sm font-medium ${getPercentageColor(
                  analyticsData.fileUploads.percentage
                )}`}
              >
                {getPercentageIcon(analyticsData.fileUploads.percentage)}
                <span>{Math.abs(analyticsData.fileUploads.percentage)}%</span>
              </span>
              <span className="text-sm text-gray-600">from last period</span>
            </div>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiFile className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Storage Usage
              </h3>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">
              {analyticsData.storageUsage.current} GB
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`flex items-center space-x-1 text-sm font-medium ${getPercentageColor(
                  analyticsData.storageUsage.percentage
                )}`}
              >
                {getPercentageIcon(analyticsData.storageUsage.percentage)}
                <span>{Math.abs(analyticsData.storageUsage.percentage)}%</span>
              </span>
              <span className="text-sm text-gray-600">from last period</span>
            </div>
          </div>
        </div>
      </div>

      {/* File Types Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Top File Types
          </h3>
          <FiBarChart2 className="w-5 h-5 text-gray-500" />
        </div>
        <div className="space-y-4">
          {analyticsData.topFileTypes.map((fileType, index) => (
            <div
              key={fileType.type}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded text-white text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-900">
                  {fileType.type}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1 w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${fileType.percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 w-12 text-right">
                  {fileType.percentage}%
                </div>
                <div className="text-sm font-medium text-gray-900 w-16 text-right">
                  {formatNumber(fileType.count)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <FiCalendar className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Enhanced Analytics Coming Soon
            </p>
            <p className="text-sm text-blue-700">
              Advanced charts, real-time data, and detailed insights will be
              available in the next update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

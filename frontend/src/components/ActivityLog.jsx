import React, { useState, useEffect, useContext } from "react";
import {
  FiActivity,
  FiUpload,
  FiDownload,
  FiEye,
  FiTrash2,
  FiUser,
  FiClock,
  FiCalendar,
  FiFilter,
} from "react-icons/fi";
import { UserContext } from "../context/UserContext";
import { userApi } from "../utils/api";
import { toast } from "react-toastify";

const ActivityLog = () => {
  const { user } = useContext(UserContext);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("7");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch actual activity data
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await userApi.getActivity({
          page: pagination.page,
          limit: pagination.limit,
          action: filter === "all" ? undefined : mapFilterToAction(filter),
          timeRange: parseInt(timeRange),
        });

        if (response.data.success) {
          setActivities(response.data.data.activities);
          setPagination(response.data.data.pagination);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast.error("Failed to load activity data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [filter, timeRange, pagination.page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filter, timeRange]);

  // Map frontend filter values to backend action values
  const mapFilterToAction = (filterValue) => {
    const actionMap = {
      upload: "FILE_UPLOAD",
      download: "FILE_DOWNLOAD",
      view: "FILE_VIEW",
      delete: "FILE_DELETE",
      login: "LOGIN",
    };
    return actionMap[filterValue] || filterValue;
  };

  // Map backend action to frontend type for styling
  const mapActionToType = (action) => {
    const typeMap = {
      FILE_UPLOAD: "upload",
      FILE_DOWNLOAD: "download",
      FILE_VIEW: "view",
      FILE_DELETE: "delete",
      LOGIN: "login",
      LOGOUT: "login",
      PROFILE_UPDATE: "login",
      PROFILE_PICTURE_UPDATE: "login",
      PASSWORD_CHANGE: "login",
      DASHBOARD_VIEW: "view",
    };
    return typeMap[action] || "other";
  };

  const getActivityIcon = (activity) => {
    const type = mapActionToType(activity.action);
    switch (type) {
      case "upload":
        return <FiUpload className="w-4 h-4" />;
      case "download":
        return <FiDownload className="w-4 h-4" />;
      case "view":
        return <FiEye className="w-4 h-4" />;
      case "delete":
        return <FiTrash2 className="w-4 h-4" />;
      case "login":
        return <FiUser className="w-4 h-4" />;
      default:
        return <FiActivity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (activity) => {
    const type = mapActionToType(activity.action);
    switch (type) {
      case "upload":
        return "bg-green-100 text-green-600 border-green-200";
      case "download":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "view":
        return "bg-purple-100 text-purple-600 border-purple-200";
      case "delete":
        return "bg-red-100 text-red-600 border-red-200";
      case "login":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diff = now - activityTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  // Format activity details based on action type and data
  const formatActivityDetails = (activity) => {
    if (activity.fileSize) {
      const fileSizeInMB = (activity.fileSize / (1024 * 1024)).toFixed(2);
      return `File size: ${fileSizeInMB} MB`;
    }
    if (activity.details) {
      if (typeof activity.details === "object") {
        return Object.entries(activity.details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", ");
      }
      return activity.details;
    }
    return "";
  };

  // Calculate stats from actual activities
  const activityStats = {
    total: pagination.total || activities.length,
    uploads: activities.filter((a) => mapActionToType(a.action) === "upload")
      .length,
    downloads: activities.filter(
      (a) => mapActionToType(a.action) === "download"
    ).length,
    views: activities.filter((a) => mapActionToType(a.action) === "view")
      .length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <FiActivity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
              <p className="text-gray-600">
                Track your recent file operations and account activity
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiActivity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activityStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FiUpload className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Uploads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activityStats.uploads}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiDownload className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activityStats.downloads}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiEye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activityStats.views}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiFilter className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">
                  Filter by type:
                </label>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Activities</option>
                <option value="upload">Uploads</option>
                <option value="download">Downloads</option>
                <option value="view">Views</option>
                <option value="delete">Deletions</option>
                <option value="login">Logins</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">
                  Time range:
                </label>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading activity...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center">
              <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No activities found for the selected filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full border flex items-center justify-center ${getActivityColor(
                        activity
                      )}`}
                    >
                      {getActivityIcon(activity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <FiClock className="w-3 h-3" />
                          <span>{formatTimeAgo(activity.timestamp)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatActivityDetails(activity)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} activities
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;

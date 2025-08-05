import React, { useState, useEffect } from "react";
import {
  adminApi,
  handleAdminApiError,
  formatAdminDate,
  getSeverityColor,
} from "../../../utils/adminApi";
import {
  FiShield,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiAlertTriangle,
  FiUser,
  FiFile,
  FiSettings,
  FiClock,
  FiInfo,
} from "react-icons/fi";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    search: "",
    action: "",
    severity: "",
    targetType: "",
    timeRange: "7d",
    page: 1,
    limit: 20,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchAuditLogs = async () => {
    try {
      setError(null);
      const response = await adminApi.security.getAuditLogs(filters);
      setLogs(response.data.logs || []);
      setPagination(
        response.data.pagination || { page: 1, total: 0, pages: 0 }
      );
    } catch (err) {
      console.error("Audit logs fetch error:", err);
      setError(handleAdminApiError(err, "Failed to load audit logs"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAuditLogs();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getActionIcon = (action) => {
    if (action.includes("USER")) return FiUser;
    if (action.includes("FILE")) return FiFile;
    if (action.includes("SETTINGS")) return FiSettings;
    return FiShield;
  };

  const getActionColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      default:
        return "text-green-600";
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading audit logs...</p>
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
              Error loading audit logs
            </h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchAuditLogs}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-600"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">
            Track all administrative actions and system changes
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search actions..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filters.targetType}
            onChange={(e) => handleFilterChange("targetType", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Types</option>
            <option value="user">User</option>
            <option value="file">File</option>
            <option value="system">System</option>
            <option value="settings">Settings</option>
          </select>

          <select
            value={filters.timeRange}
            onChange={(e) => handleFilterChange("timeRange", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <select
            value={filters.limit}
            onChange={(e) =>
              handleFilterChange("limit", parseInt(e.target.value))
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Audit Logs ({pagination.total} total)
          </h3>
        </div>

        {logs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => {
                    const ActionIcon = getActionIcon(log.action);
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ActionIcon
                              className={`w-5 h-5 mr-3 ${getActionColor(
                                log.severity
                              )}`}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.action.replace(/_/g, " ")}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.targetType}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {log.admin?.profilePicture ? (
                              <img
                                className="h-8 w-8 rounded-full mr-3"
                                src={log.admin.profilePicture}
                                alt=""
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                                <FiUser className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.admin?.name || "System"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.admin?.email || "Automated"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                log.targetType === "user"
                                  ? "bg-blue-100 text-blue-800"
                                  : log.targetType === "file"
                                  ? "bg-green-100 text-green-800"
                                  : log.targetType === "system"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {log.targetType}
                            </span>
                            {log.targetId && (
                              <span className="ml-2 text-xs text-gray-500">
                                ID: {log.targetId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(
                              log.severity
                            )}`}
                          >
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FiClock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {formatAdminDate(log.createdAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="flex items-center text-sm text-purple-600 hover:text-purple-800"
                          >
                            <FiInfo className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * filters.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * filters.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                      let pageNumber;
                      if (pagination.pages <= 5) {
                        pageNumber = i + 1;
                      } else {
                        const start = Math.max(1, pagination.page - 2);
                        pageNumber = start + i;
                      }
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1 text-sm border rounded ${
                            pagination.page === pageNumber
                              ? "bg-purple-600 text-white border-purple-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <FiShield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No audit logs found</p>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Audit Log Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Action
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLog.action}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Admin
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLog.admin?.name} ({selectedLog.admin?.email})
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  IP Address
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLog.ipAddress || "Unknown"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User Agent
                </label>
                <p className="mt-1 text-sm text-gray-900 break-all">
                  {selectedLog.userAgent || "Unknown"}
                </p>
              </div>
              {selectedLog.details && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Details
                  </label>
                  <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;

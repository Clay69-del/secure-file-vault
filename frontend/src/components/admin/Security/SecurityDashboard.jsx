import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  adminApi,
  handleAdminApiError,
  formatAdminDate,
} from "../../../utils/adminApi";
import {
  FiShield,
  FiAlertTriangle,
  FiEye,
  FiUser,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiFilter,
} from "react-icons/fi";

const SecurityDashboard = () => {
  const [loginAttempts, setLoginAttempts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [securityStats, setSecurityStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSecurityData = async () => {
    try {
      setError(null);
      const [attemptsResponse, logsResponse] = await Promise.all([
        adminApi.security.getLoginAttempts({ limit: 10 }),
        adminApi.security.getAuditLogs({ limit: 10 }),
      ]);

      setLoginAttempts(attemptsResponse.data.attempts || []);
      setAuditLogs(logsResponse.data.logs || []);

      // Calculate security stats
      const attempts = attemptsResponse.data.attempts || [];
      const successfulLogins = attempts.filter((a) => a.success).length;
      const failedLogins = attempts.filter((a) => !a.success).length;
      const uniqueIPs = new Set(attempts.map((a) => a.ipAddress)).size;

      setSecurityStats({
        totalAttempts: attempts.length,
        successfulLogins,
        failedLogins,
        uniqueIPs,
        successRate:
          attempts.length > 0
            ? Math.round((successfulLogins / attempts.length) * 100)
            : 0,
      });
    } catch (err) {
      console.error("Security data fetch error:", err);
      setError(handleAdminApiError(err, "Failed to load security data"));

      // Set fallback data to prevent component from breaking
      setLoginAttempts([]);
      setAuditLogs([]);
      setSecurityStats({
        totalAttempts: 0,
        successfulLogins: 0,
        failedLogins: 0,
        uniqueIPs: 0,
        successRate: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSecurityData();
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading security data...</p>
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
              Error loading security dashboard
            </h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchSecurityData}
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-600"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    color,
    link,
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p
            className={`text-sm flex items-center mt-1 ${
              changeType === "increase"
                ? "text-red-600"
                : changeType === "decrease"
                ? "text-green-600"
                : "text-gray-600"
            }`}
          >
            {changeType === "increase" && (
              <FiTrendingUp className="w-4 h-4 mr-1" />
            )}
            {changeType === "decrease" && (
              <FiTrendingDown className="w-4 h-4 mr-1" />
            )}
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      {link && (
        <Link
          to={link}
          className="mt-4 text-sm text-purple-600 hover:text-purple-800 flex items-center"
        >
          View details
          <FiEye className="w-4 h-4 ml-1" />
        </Link>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Security Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor system security and access patterns
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

      {/* Security Stats */}
      {securityStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Login Attempts"
            value={securityStats.totalAttempts}
            change="Last 24 hours"
            changeType="neutral"
            icon={FiUser}
            color="blue"
            link="/admin/security/login-attempts"
          />
          <StatCard
            title="Failed Logins"
            value={securityStats.failedLogins}
            change={`${100 - securityStats.successRate}% failure rate`}
            changeType={
              securityStats.failedLogins > 10 ? "increase" : "neutral"
            }
            icon={FiAlertTriangle}
            color="red"
            link="/admin/security/login-attempts?success=false"
          />
          <StatCard
            title="Successful Logins"
            value={securityStats.successfulLogins}
            change={`${securityStats.successRate}% success rate`}
            changeType="neutral"
            icon={FiShield}
            color="green"
            link="/admin/security/login-attempts?success=true"
          />
          <StatCard
            title="Unique IP Addresses"
            value={securityStats.uniqueIPs}
            change="Different locations"
            changeType="neutral"
            icon={FiClock}
            color="orange"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Login Attempts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Login Attempts
              </h3>
              <Link
                to="/admin/security/login-attempts"
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {loginAttempts.length > 0 ? (
              <div className="space-y-4">
                {loginAttempts.slice(0, 5).map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          attempt.success ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {attempt.email || attempt.User?.email || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {attempt.ipAddress} •{" "}
                          {formatAdminDate(attempt.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        attempt.success
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {attempt.success ? "Success" : "Failed"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No recent login attempts
              </p>
            )}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Admin Actions
              </h3>
              <Link
                to="/admin/security/audit-logs"
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {auditLogs.length > 0 ? (
              <div className="space-y-4">
                {auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between py-2"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          log.severity === "critical"
                            ? "bg-red-500"
                            : log.severity === "high"
                            ? "bg-orange-500"
                            : log.severity === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-gray-500">
                          by {log.admin?.name || "Unknown"} •{" "}
                          {formatAdminDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.severity === "critical"
                          ? "bg-red-100 text-red-800"
                          : log.severity === "high"
                          ? "bg-orange-100 text-orange-800"
                          : log.severity === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {log.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No recent admin actions
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Security Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/security/login-attempts"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <FiUser className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Login Attempts</p>
              <p className="text-sm text-gray-500">Monitor authentication</p>
            </div>
          </Link>
          <Link
            to="/admin/security/audit-logs"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <FiShield className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Audit Logs</p>
              <p className="text-sm text-gray-500">Track admin actions</p>
            </div>
          </Link>
          <Link
            to="/admin/security/alerts"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <FiAlertTriangle className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Security Alerts</p>
              <p className="text-sm text-gray-500">Review threats</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  adminApi,
  handleAdminApiError,
  formatAdminDate,
  formatBytes,
  getStatusColor,
  getRoleColor,
} from "../../../utils/adminApi";
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiRefreshCw,
  FiAlertTriangle,
  FiUser,
  FiMail,
  FiCalendar,
  FiHardDrive,
} from "react-icons/fi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "DESC",
    page: 1,
    limit: 20,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState({
    show: false,
    type: "",
    user: null,
  });

  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await adminApi.users.getAll(filters);
      setUsers(response.data.users || []);
      setPagination(
        response.data.pagination || { page: 1, total: 0, pages: 0 }
      );
    } catch (err) {
      console.error("Users fetch error:", err);
      setError(handleAdminApiError(err, "Failed to load users"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleUserAction = async (action, userId, data = {}) => {
    try {
      let response;
      switch (action) {
        case "suspend":
          response = await adminApi.users.suspend(userId, data.reason);
          break;
        case "unsuspend":
          response = await adminApi.users.unsuspend(userId);
          break;
        case "delete":
          response = await adminApi.users.delete(userId, data.hardDelete);
          break;
        case "resetPassword":
          response = await adminApi.users.resetPassword(
            userId,
            data.newPassword
          );
          break;
        default:
          throw new Error("Invalid action");
      }

      if (response.data.success) {
        await fetchUsers();
        setActionModal({ show: false, type: "", user: null });
      }
    } catch (err) {
      console.error(`${action} error:`, err);
      alert(handleAdminApiError(err, `Failed to ${action} user`));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading users...</p>
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
              Error loading users
            </h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchUsers}
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage all users in your system</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <FiRefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <FiPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="createdAt">Created Date</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="lastLoginAt">Last Login</option>
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
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Users ({pagination.total} total)
          </h3>
        </div>

        {users.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Files
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Storage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.profilePicture ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.profilePicture}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                                <FiUser className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status}
                          </span>
                          {user.isLocked && (
                            <FiLock
                              className="w-4 h-4 text-red-500 ml-2"
                              title="Account locked"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.fileCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatBytes(user.totalStorage || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLoginAt
                          ? formatAdminDate(user.lastLoginAt)
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-purple-600 hover:text-purple-900"
                            title="View Details"
                          >
                            <FiUser className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setActionModal({ show: true, type: "edit", user })
                            }
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit User"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          {user.status === "active" ? (
                            <button
                              onClick={() =>
                                setActionModal({
                                  show: true,
                                  type: "suspend",
                                  user,
                                })
                              }
                              className="text-orange-600 hover:text-orange-900"
                              title="Suspend User"
                            >
                              <FiLock className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleUserAction("unsuspend", user.id)
                              }
                              className="text-green-600 hover:text-green-900"
                              title="Unsuspend User"
                            >
                              <FiUnlock className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setActionModal({
                                show: true,
                                type: "delete",
                                user,
                              })
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.currentPage - 1) * filters.limit + 1}{" "}
                    to{" "}
                    {Math.min(
                      pagination.currentPage * filters.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(pagination.totalPages, 5))].map(
                      (_, i) => {
                        let pageNumber;
                        if (pagination.totalPages <= 5) {
                          pageNumber = i + 1;
                        } else {
                          const start = Math.max(1, pagination.currentPage - 2);
                          pageNumber = start + i;
                        }
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-1 text-sm border rounded ${
                              pagination.currentPage === pageNumber
                                ? "bg-purple-600 text-white border-purple-600"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                    )}
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
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
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Action Modals */}
      {actionModal.show && (
        <ActionModal
          type={actionModal.type}
          user={actionModal.user}
          onConfirm={handleUserAction}
          onCancel={() => setActionModal({ show: false, type: "", user: null })}
        />
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

// Action Modal Component
const ActionModal = ({ type, user, onConfirm, onCancel }) => {
  const [reason, setReason] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [hardDelete, setHardDelete] = useState(false);

  const handleSubmit = () => {
    const data = {};
    if (type === "suspend") data.reason = reason;
    if (type === "resetPassword") data.newPassword = newPassword;
    if (type === "delete") data.hardDelete = hardDelete;

    onConfirm(type, user.id, data);
  };

  const getModalConfig = () => {
    switch (type) {
      case "suspend":
        return {
          title: "Suspend User",
          message: `Are you sure you want to suspend ${user.name}?`,
          color: "orange",
          showReason: true,
        };
      case "delete":
        return {
          title: "Delete User",
          message: `Are you sure you want to delete ${user.name}?`,
          color: "red",
          showHardDelete: true,
        };
      case "resetPassword":
        return {
          title: "Reset Password",
          message: `Reset password for ${user.name}`,
          color: "blue",
          showPassword: true,
        };
      default:
        return { title: "", message: "", color: "gray" };
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {config.title}
        </h3>
        <p className="text-gray-600 mb-4">{config.message}</p>

        {config.showReason && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Enter reason for suspension..."
            />
          </div>
        )}

        {config.showPassword && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter new password..."
              minLength={6}
              required
            />
          </div>
        )}

        {config.showHardDelete && (
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={hardDelete}
                onChange={(e) => setHardDelete(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Permanently delete (cannot be undone)
              </span>
            </label>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={type === "resetPassword" && !newPassword}
            className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
              config.color === "red"
                ? "bg-red-600 hover:bg-red-700"
                : config.color === "orange"
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">User Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <span
                className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                  user.role
                )}`}
              >
                {user.role.replace("_", " ")}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <span
                className={`mt-1 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  user.status
                )}`}
              >
                {user.status}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Files
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.fileCount || 0}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Storage Used
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {formatBytes(user.totalStorage || 0)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Created
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {formatAdminDate(user.createdAt)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Login
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user.lastLoginAt ? formatAdminDate(user.lastLoginAt) : "Never"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

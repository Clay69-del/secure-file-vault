import api from "./api";

/**
 * Admin API utilities for frontend
 */
export const adminApi = {
  // Dashboard endpoints
  dashboard: {
    getStats: () => api.get("/admin/dashboard/stats"),
    getActivity: (limit = 20) =>
      api.get(`/admin/dashboard/activity?limit=${limit}`),
    getHealth: () => api.get("/admin/dashboard/health"),
  },

  // Analytics endpoints
  analytics: {
    getData: (timeRange = "7d") =>
      api.get(`/admin/analytics?timeRange=${timeRange}`),
    getEnhanced: (timeRange = "30d") =>
      api.get(`/admin/analytics/enhanced?timeRange=${timeRange}`),
  },

  // User management endpoints
  users: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || "",
        role: params.role || "",
        status: params.status || "",
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "DESC",
      }).toString();
      return api.get(`/admin/users?${queryString}`);
    },

    getById: (id) => api.get(`/admin/users/${id}`),

    update: (id, data) => api.put(`/admin/users/${id}`, data),

    suspend: (id, reason) => api.put(`/admin/users/${id}/suspend`, { reason }),

    unsuspend: (id) => api.put(`/admin/users/${id}/unsuspend`),

    resetPassword: (id, newPassword) =>
      api.put(`/admin/users/${id}/reset-password`, { newPassword }),

    delete: (id, hardDelete = false) =>
      api.delete(`/admin/users/${id}`, { data: { hardDelete } }),
  },

  // File management endpoints
  files: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || "",
        fileType: params.fileType || "",
        userId: params.userId || "",
        sortBy: params.sortBy || "uploaded",
        sortOrder: params.sortOrder || "DESC",
      }).toString();
      return api.get(`/admin/files?${queryString}`);
    },

    getById: (id) => api.get(`/admin/files/${id}`),

    delete: (id, reason) =>
      api.delete(`/admin/files/${id}`, { data: { reason } }),

    download: (id) =>
      api.get(`/admin/files/${id}/download`, { responseType: "blob" }),
  },

  // Security endpoints
  security: {
    getLoginAttempts: (params = {}) => {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 50,
        success: params.success || "",
        email: params.email || "",
        ipAddress: params.ipAddress || "",
        startDate: params.startDate || "",
        endDate: params.endDate || "",
      }).toString();
      return api.get(`/admin/security/login-attempts?${queryString}`);
    },

    getAuditLogs: (params = {}) => {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 50,
        action: params.action || "",
        adminId: params.adminId || "",
        severity: params.severity || "",
        targetType: params.targetType || "",
        startDate: params.startDate || "",
        endDate: params.endDate || "",
      }).toString();
      return api.get(`/admin/security/audit-logs?${queryString}`);
    },
  },

  // Settings endpoints
  settings: {
    getAll: () => api.get("/admin/settings"),

    update: (settings) => api.put("/admin/settings", { settings }),

    getSetting: (key) => api.get(`/admin/settings/${key}`),

    updateSetting: (key, value) => api.put(`/admin/settings/${key}`, { value }),

    resetToDefaults: (category) =>
      api.post("/admin/settings/reset", { category }),
  },

  // Super admin endpoints
  super: {
    createAdmin: (userData) => api.post("/admin/super/create-admin", userData),

    promoteUser: (userId, role) =>
      api.post(`/admin/super/promote/${userId}`, { role }),

    demoteAdmin: (userId) => api.post(`/admin/super/demote/${userId}`),

    getAllAdmins: () => api.get("/admin/super/admins"),

    toggleMaintenance: (enabled, message) =>
      api.post("/admin/super/maintenance", { enabled, message }),

    getSystemStats: () => api.get("/admin/super/system-stats"),

    cleanupData: (type, days) =>
      api.post("/admin/super/cleanup", { type, days }),

    createBackup: (includeFiles) =>
      api.post("/admin/super/backup", { includeFiles }),

    healthCheck: () => api.get("/admin/super/health"),
  },
};

/**
 * Helper function to handle admin API errors consistently
 */
export const handleAdminApiError = (
  error,
  defaultMessage = "An error occurred"
) => {
  if (error.response?.status === 403) {
    return "You do not have permission to perform this action";
  }

  if (error.response?.status === 401) {
    return "Your session has expired. Please log in again";
  }

  return error.response?.data?.error || error.message || defaultMessage;
};

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Format date for admin panel display
 */
export const formatAdminDate = (date, options = {}) => {
  if (!date) return "Never";

  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = (now - dateObj) / 1000;

  // Show relative time for recent dates
  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  // Show full date for older entries
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  });
};

/**
 * Get status badge color based on status
 */
export const getStatusColor = (status) => {
  const colors = {
    active: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    inactive: "bg-gray-100 text-gray-800",
    locked: "bg-yellow-100 text-yellow-800",
  };

  return colors[status] || "bg-gray-100 text-gray-800";
};

/**
 * Get role badge color based on role
 */
export const getRoleColor = (role) => {
  const colors = {
    user: "bg-blue-100 text-blue-800",
    admin: "bg-purple-100 text-purple-800",
    super_admin: "bg-red-100 text-red-800",
  };

  return colors[role] || "bg-gray-100 text-gray-800";
};

/**
 * Get severity badge color for audit logs
 */
export const getSeverityColor = (severity) => {
  const colors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return colors[severity] || "bg-gray-100 text-gray-800";
};

export default adminApi;

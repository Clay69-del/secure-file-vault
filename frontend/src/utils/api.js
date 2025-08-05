import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    try {
      const userJson = localStorage.getItem("user");
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      console.error("Could not parse user from localStorage:", error);
      // Clear corrupted user data
      localStorage.removeItem("user");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response.data?.success === false) {
      return Promise.reject(response.data);
    }
    // Return the full response object, not just response.data
    return response;
  },
  (error) => {
    // Handle errors
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An error occurred";

    // Show error toast
    if (errorMessage !== "Unauthorized" && !error.config?.skipErrorToast) {
      toast.error(errorMessage);
    }

    // Handle unauthorized errors
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Redirect to login if not already there
      if (!window.location.pathname.includes("login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// File API methods
export const fileApi = {
  // Get all files for current user
  getFiles: () => api.get("/files"),

  // Upload a file
  uploadFile: (formData, onUploadProgress) => {
    return api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          onUploadProgress(progress);
        }
      },
    });
  },

  // View/Download a file
  viewFile: (fileId) => {
    return api.get(`/files/view/${fileId}`, {
      responseType: "blob",
      skipErrorToast: true,
    });
  },

  // Delete a file
  deleteFile: (fileId) => {
    return api.delete(`/files/${fileId}`);
  },
};

// User API methods
export const userApi = {
  // Get user activity
  getActivity: (params = {}) => {
    const { page = 1, limit = 20, action = "all", timeRange = 7 } = params;
    return api.get(`/users/me/activity`, {
      params: { page, limit, action, timeRange },
    });
  },
};

export default api;

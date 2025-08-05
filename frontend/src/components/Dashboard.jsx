import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import api, { userApi } from "../utils/api";
import { toast } from "react-toastify";
import {
  FiDownload,
  FiTrash2,
  FiEye,
  FiGrid,
  FiList,
  FiFile,
  FiImage,
  FiUpload,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiShare,
  FiClock,
  FiFolder,
  FiHardDrive,
  FiActivity,
  FiTrendingUp,
  FiUsers,
  FiShield,
  FiPlus,
  FiChevronDown,
} from "react-icons/fi";

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getActivityIcon = (action) => {
  switch (action) {
    case "FILE_UPLOAD":
      return <FiUpload className="w-4 h-4 text-green-600" />;
    case "FILE_DOWNLOAD":
    case "FILE_VIEW":
      return <FiDownload className="w-4 h-4 text-blue-600" />;
    case "FILE_DELETE":
      return <FiTrash2 className="w-4 h-4 text-red-600" />;
    case "LOGIN":
      return <FiActivity className="w-4 h-4 text-purple-600" />;
    case "PROFILE_UPDATE":
    case "PROFILE_PICTURE_UPDATE":
    case "PASSWORD_CHANGE":
      return <FiActivity className="w-4 h-4 text-indigo-600" />;
    default:
      return <FiActivity className="w-4 h-4 text-gray-600" />;
  }
};

const getActivityIconBg = (action) => {
  switch (action) {
    case "FILE_UPLOAD":
      return "bg-green-100";
    case "FILE_DOWNLOAD":
    case "FILE_VIEW":
      return "bg-blue-100";
    case "FILE_DELETE":
      return "bg-red-100";
    case "LOGIN":
      return "bg-purple-100";
    case "PROFILE_UPDATE":
    case "PROFILE_PICTURE_UPDATE":
    case "PASSWORD_CHANGE":
      return "bg-indigo-100";
    default:
      return "bg-gray-100";
  }
};

const FileIcon = ({ mimeType, className = "" }) => {
  if (mimeType?.startsWith("image/")) {
    return <FiImage className={className} />;
  } else if (mimeType === "application/pdf") {
    return <FiFile className={className} />;
  }
  return <FiFile className={className} />;
};

const BACKEND_URL = "http://localhost:5000";

const getProfilePicUrl = (user, picOverride) => {
  const pic = picOverride || user?.profilePicture;
  if (pic) {
    return `${BACKEND_URL}${pic}`;
  }
  if (user?.picture) return user.picture;
  return "/default-profile.jpg";
};

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Dashboard stats
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    storageUsed: 0,
    storageLimit: 5368709120, // 5GB in bytes
    recentUploads: 0,
  });

  useEffect(() => {
    fetchFiles();
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const response = await userApi.getActivity({ limit: 5, timeRange: 7 });

      if (response.data?.success && response.data?.data?.activities) {
        setActivities(response.data.data.activities);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      // Don't show toast error for activities as it's not critical
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/files");

      // Try different possible response structures
      let files = [];
      if (response.data?.data?.files) {
        files = response.data.data.files;
      } else if (response.data?.files) {
        files = response.data.files;
      } else if (Array.isArray(response.data)) {
        files = response.data;
      }

      setFiles(files);

      // Calculate stats
      const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
      const recentUploads = files.filter((file) => {
        const uploadDate = new Date(file.uploaded);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return uploadDate > weekAgo;
      }).length;

      setStats((prev) => ({
        ...prev,
        totalFiles: files.length,
        totalSize,
        storageUsed: totalSize,
        recentUploads,
      }));
    } catch (error) {
      console.error("Error fetching files:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await api.get(`/files/${fileId}/download`);
      if (response.downloadUrl) {
        const link = document.createElement("a");
        link.href = response.downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      await api.delete(`/files/${fileId}`);
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      toast.success("File deleted successfully");
      fetchFiles(); // Refresh stats
      fetchActivities(); // Refresh activities
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    }
  };

  const filteredFiles = files
    .filter((file) => {
      const matchesSearch = file.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === "all" ||
        (filterType === "images" && file.mimeType?.startsWith("image/")) ||
        (filterType === "documents" && file.mimeType?.includes("pdf")) ||
        (filterType === "others" &&
          !file.mimeType?.startsWith("image/") &&
          !file.mimeType?.includes("pdf"));

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.uploaded) - new Date(a.uploaded);
        case "oldest":
          return new Date(a.uploaded) - new Date(b.uploaded);
        case "name":
          return a.name?.localeCompare(b.name);
        case "size":
          return (b.size || 0) - (a.size || 0);
        default:
          return 0;
      }
    });

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your secure files and monitor your storage usage
          </p>
        </div>
        <Link
          to="/upload"
          className="mt-4 lg:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/25"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Upload Files
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Files</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalFiles}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FiFolder className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatFileSize(stats.storageUsed)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <FiHardDrive className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{formatFileSize(stats.storageUsed)}</span>
              <span>{formatFileSize(stats.storageLimit)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Recent Uploads
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.recentUploads}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Security Level
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">High</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <FiShield className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Types Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">File Types</h3>
            <FiActivity className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {(() => {
              const fileTypes = files.reduce((acc, file) => {
                let category = "Others";
                if (file.mimeType?.startsWith("image/")) category = "Images";
                else if (file.mimeType?.includes("pdf")) category = "Documents";

                acc[category] = (acc[category] || 0) + 1;
                return acc;
              }, {});

              return Object.entries(fileTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        type === "Images"
                          ? "bg-blue-500"
                          : type === "Documents"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <span className="text-gray-700">{type}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <Link
              to="/activity"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {loadingActivities ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 ${getActivityIconBg(
                      activity.action
                    )} rounded-lg flex items-center justify-center`}
                  >
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()} •{" "}
                      {new Date(activity.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {activity.fileSize &&
                        ` • ${formatFileSize(activity.fileSize)}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Files Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h2 className="text-xl font-bold text-gray-900">Your Files</h2>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Files</option>
                  <option value="images">Images</option>
                  <option value="documents">Documents</option>
                  <option value="others">Others</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="size">Size</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-purple-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-purple-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Files Content */}
        <div className="p-6">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FiFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No files found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "No files match your search criteria."
                  : "Upload your first file to get started."}
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                <FiUpload className="w-4 h-4 mr-2" />
                Upload Files
              </Link>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-2"
              }
            >
              {filteredFiles.map((file) =>
                viewMode === "grid" ? (
                  <div
                    key={file.id}
                    className="group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <FileIcon
                        mimeType={file.mimeType}
                        className="w-8 h-8 text-purple-600"
                      />
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDownload(file.id, file.name)}
                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                            title="Download"
                          >
                            <FiDownload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <h3
                      className="font-medium text-gray-900 truncate mb-1"
                      title={file.name}
                    >
                      {file.name}
                    </h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>{formatFileSize(file.size)}</p>
                      <p>{new Date(file.uploaded).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <FileIcon
                        mimeType={file.mimeType}
                        className="w-8 h-8 text-purple-600 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {file.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatFileSize(file.size)}</span>
                          <span>
                            {new Date(file.uploaded).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDownload(file.id, file.name)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Download"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

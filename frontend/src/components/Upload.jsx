import React, { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUpload,
  FiX,
  FiTrash2,
  FiDownload,
  FiAlertCircle,
  FiCheckCircle,
  FiFile,
  FiImage,
  FiFileText,
  FiArrowLeft,
  FiCloud,
  FiShield,
  FiZap,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import { UserContext } from "../context/UserContext";
import api from "../utils/api";
import { toast } from "react-toastify";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const acceptedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/x-rar-compressed",
    "video/mp4",
    "video/webm",
    "audio/mpeg",
    "audio/mp3",
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type?.startsWith("image/"))
      return <FiImage className="w-8 h-8 text-blue-500" />;
    if (type?.includes("pdf"))
      return <FiFileText className="w-8 h-8 text-red-500" />;
    if (type?.startsWith("video/"))
      return <FiFile className="w-8 h-8 text-purple-500" />;
    if (type?.startsWith("audio/"))
      return <FiFile className="w-8 h-8 text-green-500" />;
    return <FiFile className="w-8 h-8 text-gray-500" />;
  };

  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`;
    }
    if (!acceptedTypes.includes(file.type)) {
      return "File type not supported";
    }
    return null;
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (files) => {
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push({
          file,
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          status: "pending",
        });
      }
    });

    if (errors.length > 0) {
      toast.error(errors.join("\n"));
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (id) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    const uploadPromises = selectedFiles
      .filter((f) => f.status === "pending")
      .map(async (fileObj) => {
        try {
          const formData = new FormData();
          formData.append("file", fileObj.file);

          setUploadProgress((prev) => ({ ...prev, [fileObj.id]: 0 }));

          const response = await api.post("/files/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress((prev) => ({
                ...prev,
                [fileObj.id]: progress,
              }));
            },
          });

          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === fileObj.id
                ? { ...f, status: "success", uploadedFile: response }
                : f
            )
          );

          return { success: true, fileName: fileObj.name };
        } catch (error) {
          console.error("Upload error:", error);
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === fileObj.id
                ? {
                    ...f,
                    status: "error",
                    error: error.response?.data?.message || "Upload failed",
                  }
                : f
            )
          );
          return { success: false, fileName: fileObj.name, error };
        }
      });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    setIsUploading(false);

    if (successful > 0) {
      toast.success(`${successful} file(s) uploaded successfully!`);
    }
    if (failed > 0) {
      toast.error(`${failed} file(s) failed to upload`);
    }
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setUploadProgress({});
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Files</h1>
          <p className="text-gray-600 mt-2">
            Securely upload your files with end-to-end encryption
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
              dragActive
                ? "border-purple-400 bg-purple-50"
                : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept={acceptedTypes.join(",")}
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />

            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <FiCloud className="w-10 h-10 text-white" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drop files here or click to browse
                </h3>
                <p className="text-gray-600">
                  Support for images, documents, videos, and more
                </p>
              </div>

              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <FiShield className="w-4 h-4" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiZap className="w-4 h-4" />
                  <span>Fast Upload</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiFile className="w-4 h-4" />
                  <span>Max {formatFileSize(MAX_FILE_SIZE)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="border-t border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={clearAll}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  disabled={isUploading}
                >
                  Clear All
                </button>
                <button
                  onClick={uploadFiles}
                  disabled={
                    isUploading ||
                    selectedFiles.every((f) => f.status !== "pending")
                  }
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25"
                >
                  {isUploading ? (
                    <span className="flex items-center space-x-2">
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <FiUpload className="w-4 h-4" />
                      <span>Upload Files</span>
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {selectedFiles.map((fileObj) => (
                <div
                  key={fileObj.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {getFileIcon(fileObj.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {fileObj.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(fileObj.size)}
                      </p>

                      {/* Progress Bar */}
                      {fileObj.status === "pending" &&
                        uploadProgress[fileObj.id] !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Uploading...</span>
                              <span>{uploadProgress[fileObj.id]}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${uploadProgress[fileObj.id]}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                      {/* Error Message */}
                      {fileObj.status === "error" && (
                        <p className="text-sm text-red-600 mt-1">
                          {fileObj.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* Status Icons */}
                    {fileObj.status === "success" && (
                      <FiCheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {fileObj.status === "error" && (
                      <FiAlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    {fileObj.status === "pending" &&
                      uploadProgress[fileObj.id] !== undefined && (
                        <FiLoader className="w-5 h-5 text-purple-500 animate-spin" />
                      )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      disabled={isUploading && fileObj.status === "pending"}
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
          <FiAlertCircle className="w-5 h-5 mr-2" />
          Upload Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <FiCheck className="w-4 h-4 mt-0.5 text-blue-600" />
            <span>Files are encrypted before upload for maximum security</span>
          </div>
          <div className="flex items-start space-x-2">
            <FiCheck className="w-4 h-4 mt-0.5 text-blue-600" />
            <span>Maximum file size is {formatFileSize(MAX_FILE_SIZE)}</span>
          </div>
          <div className="flex items-start space-x-2">
            <FiCheck className="w-4 h-4 mt-0.5 text-blue-600" />
            <span>You can upload multiple files at once</span>
          </div>
          <div className="flex items-start space-x-2">
            <FiCheck className="w-4 h-4 mt-0.5 text-blue-600" />
            <span>Supported formats: Images, Documents, Videos, Archives</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

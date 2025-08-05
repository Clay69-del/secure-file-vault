import React, { useState, useEffect, useContext } from "react";
import {
  FiDownload,
  FiEye,
  FiTrash2,
  FiSearch,
  FiGrid,
  FiList,
  FiShield,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { fileApi } from "../utils/api";
import { UserContext } from "../context/UserContext";

/* ---------------------------------------------------------- */
/*                         MAIN COMPONENT                     */
/* ---------------------------------------------------------- */
const YourFiles = () => {
  const { user } = useContext(UserContext);

  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  /* -------------------------------------------------------- */
  /*                       FETCH FILES                        */
  /* -------------------------------------------------------- */
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();

    async function loadFiles() {
      try {
        setIsLoading(true);
        const res = await fileApi.getFiles({ signal: controller.signal });
        const rawFiles = res.data?.data?.files ?? [];

        const formatted = rawFiles.map((f) => ({
          id: f.id,
          name: f.name || f.displayName || f.originalName,
          type: f.type || f.mimeType?.split("/").pop() || "file",
          size: f.size,
          uploaded: f.uploaded || f.createdAt,
          encrypted: f.encrypted !== false,
          mimeType: f.mimeType,
          downloadUrl: `/api/files/view/${f.id}`,
        }));

        setFiles(formatted);
        setFilteredFiles(formatted);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          toast.error("Failed to load files");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadFiles();
    return () => controller.abort();
  }, [user]);

  /* -------------------------------------------------------- */
  /*                    SEARCH / FILTER                       */
  /* -------------------------------------------------------- */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFiles(files);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    setFilteredFiles(
      files.filter(
        (f) =>
          f.name.toLowerCase().includes(q) || f.type.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, files]);

  /* -------------------------------------------------------- */
  /*                   HANDLER FUNCTIONS                      */
  /* -------------------------------------------------------- */
  const handlePreview = async (file) => {
    setSelectedFile(file);

    if (file.mimeType?.startsWith("image/")) {
      try {
        const res = await fileApi.viewFile(file.id);
        const blobUrl = URL.createObjectURL(new Blob([res.data]));
        setSelectedFile((prev) => ({ ...prev, previewUrl: blobUrl }));
      } catch (err) {
        console.error(err);
        toast.error("Could not load preview");
      }
    }
    setShowPreview(true);
  };

  const handleDownload = async (file) => {
    try {
      const res = await fileApi.viewFile(file.id);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded "${file.name}"`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to download file");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file permanently?")) return;
    try {
      await fileApi.deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success("File deleted");
      if (selectedFile?.id === id) closePreview();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete file");
    }
  };

  const closePreview = () => {
    if (selectedFile?.previewUrl) URL.revokeObjectURL(selectedFile.previewUrl);
    setSelectedFile(null);
    setShowPreview(false);
  };

  /* -------------------------------------------------------- */
  /*                         HELPERS                          */
  /* -------------------------------------------------------- */
  const getIcon = (ext) =>
    ({
      docx: "📄",
      pdf: "📑",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      pptx: "📽️",
      zip: "🗄️",
      txt: "📝",
    }[ext] || "📁");

  const fmtSize = (s) => (typeof s === "number" ? `${s} MB` : s);
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  /* -------------------------------------------------------- */
  /*                         RENDER                           */
  /* -------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* --------------------------- Modal --------------------------- */}
      {showPreview && selectedFile && (
        <PreviewModal file={selectedFile} onClose={closePreview} />
      )}

      {/* -------------------------- Header -------------------------- */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Your files</h1>
            <p className="text-gray-600">
              {filteredFiles.length}{" "}
              {filteredFiles.length === 1 ? "file" : "files"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${
                viewMode === "grid"
                  ? "bg-purple-600 text-white"
                  : "hover:bg-gray-200 text-gray-500"
              }`}
            >
              <FiGrid />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${
                viewMode === "list"
                  ? "bg-purple-600 text-white"
                  : "hover:bg-gray-200 text-gray-500"
              }`}
            >
              <FiList />
            </button>
          </div>
        </div>

        {/* -------------------- Empty / Content --------------------- */}
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-gray-500">
            <span className="text-6xl">📁</span>
            <p>No files found</p>
          </div>
        ) : viewMode === "grid" ? (
          /* --------------------------- GRID --------------------------- */
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredFiles.map((f) => (
              <div
                key={f.id}
                className="group relative rounded-xl border border-gray-200 p-6 bg-white"
              >
                <div className="text-4xl text-center mb-4">
                  {getIcon(f.type)}
                </div>

                {f.encrypted && (
                  <FiShield
                    className="absolute top-3 right-3 text-blue-500"
                    title="Encrypted"
                  />
                )}

                <h3 className="text-center font-medium truncate" title={f.name}>
                  {f.name}
                </h3>

                <p className="text-center text-sm text-gray-500 mb-4">
                  {fmtSize(f.size)} • {fmtDate(f.uploaded)}
                </p>

                <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <IconBtn onClick={() => handlePreview(f)} title="Preview">
                    <FiEye />
                  </IconBtn>
                  <IconBtn onClick={() => handleDownload(f)} title="Download">
                    <FiDownload />
                  </IconBtn>
                  <IconBtn onClick={() => handleDelete(f.id)} title="Delete">
                    <FiTrash2 />
                  </IconBtn>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --------------------------- LIST --------------------------- */
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Size</Th>
                  <Th>Uploaded</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFiles.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span>{getIcon(f.type)}</span>
                        <span className="truncate" title={f.name}>
                          {f.name}
                        </span>
                        {f.encrypted && (
                          <FiShield
                            className="text-blue-500"
                            title="Encrypted"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase">{f.type}</td>
                    <td className="px-6 py-4">{fmtSize(f.size)}</td>
                    <td className="px-6 py-4">{fmtDate(f.uploaded)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <IconBtn
                          onClick={() => handlePreview(f)}
                          title="Preview"
                        >
                          <FiEye />
                        </IconBtn>
                        <IconBtn
                          onClick={() => handleDownload(f)}
                          title="Download"
                        >
                          <FiDownload />
                        </IconBtn>
                        <IconBtn
                          onClick={() => handleDelete(f.id)}
                          title="Delete"
                        >
                          <FiTrash2 />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------- */
/*                       SMALL HELPERS                        */
/* ---------------------------------------------------------- */
const IconBtn = ({ children, ...rest }) => (
  <button {...rest} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
    {children}
  </button>
);

const Th = ({ children, className = "", ...rest }) => (
  <th
    {...rest}
    className={`px-6 py-3 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider ${className}`}
  >
    {children}
  </th>
);

/* ----------------------- Preview modal --------------------- */
const PreviewModal = ({ file, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold truncate">{file.name}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <div className="p-6 max-h-[70vh] overflow-auto text-center">
        {file.mimeType?.startsWith("image/") ? (
          <img
            src={file.previewUrl ?? file.downloadUrl}
            alt={file.name}
            className="max-w-full mx-auto"
          />
        ) : file.mimeType === "application/pdf" ? (
          <iframe
            src={file.downloadUrl}
            title={file.name}
            className="w-full h-96"
          />
        ) : (
          <div className="text-gray-500">No preview available.</div>
        )}
      </div>

      <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default YourFiles;

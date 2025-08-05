import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUpload,
  FiFileText,
  FiUser,
  FiSettings,
  FiLogOut,
  FiFolder,
  FiCloud,
  FiShield,
  FiActivity,
} from "react-icons/fi";
import { UserContext } from "../context/UserContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarItems = [
    {
      path: "/dashboard",
      icon: FiHome,
      label: "Dashboard",
      description: "Overview & Analytics",
    },
    {
      path: "/upload",
      icon: FiUpload,
      label: "Upload Files",
      description: "Add new files",
    },
    {
      path: "/files",
      icon: FiFolder,
      label: "My Files",
      description: "Browse & manage",
    },
    {
      path: "/shared",
      icon: FiCloud,
      label: "Shared",
      description: "Shared with me",
    },
    {
      path: "/security",
      icon: FiShield,
      label: "Security",
      description: "Privacy settings",
    },
    {
      path: "/activity",
      icon: FiActivity,
      label: "Activity",
      description: "Recent actions",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40">
      <div className="flex flex-col h-full">
        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${
                    active
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon
                  className={`
                    flex-shrink-0 w-5 h-5 mr-3 transition-colors
                    ${
                      active
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-500"
                    }
                  `}
                />
                <div className="flex-1">
                  <div
                    className={`text-sm font-medium ${
                      active ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`text-xs ${
                      active ? "text-purple-100" : "text-gray-500"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            to="/profile"
            className={`
              group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
              ${
                isActive("/profile")
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            <FiUser
              className={`
                flex-shrink-0 w-5 h-5 mr-3 transition-colors
                ${
                  isActive("/profile")
                    ? "text-white"
                    : "text-gray-400 group-hover:text-gray-500"
                }
              `}
            />
            <div className="flex-1">
              <div
                className={`text-sm font-medium ${
                  isActive("/profile") ? "text-white" : "text-gray-900"
                }`}
              >
                Profile
              </div>
              <div
                className={`text-xs ${
                  isActive("/profile") ? "text-purple-100" : "text-gray-500"
                }`}
              >
                Account settings
              </div>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="group w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200"
          >
            <FiLogOut className="flex-shrink-0 w-5 h-5 mr-3 text-red-400 group-hover:text-red-500" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">Sign Out</div>
              <div className="text-xs text-red-400">Logout securely</div>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

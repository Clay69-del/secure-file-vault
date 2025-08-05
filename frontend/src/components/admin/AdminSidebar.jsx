import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import {
  FiHome,
  FiUsers,
  FiFile,
  FiShield,
  FiSettings,
  FiActivity,
  FiDatabase,
  FiAlertTriangle,
  FiBarChart2,
  FiLock,
} from "react-icons/fi";

const AdminSidebar = () => {
  const location = useLocation();
  const { isSuperAdmin } = useAdmin();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: FiHome,
      current: location.pathname === "/admin",
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: FiBarChart2,
      current: location.pathname === "/admin/analytics",
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: FiUsers,
      current: location.pathname.startsWith("/admin/users"),
    },
    {
      name: "File Management",
      href: "/admin/files",
      icon: FiFile,
      current: location.pathname.startsWith("/admin/files"),
    },
    {
      name: "Security",
      href: "/admin/security",
      icon: FiShield,
      current: location.pathname.startsWith("/admin/security"),
      children: [
        {
          name: "Dashboard",
          href: "/admin/security",
          current: location.pathname === "/admin/security",
        },
        {
          name: "Login Attempts",
          href: "/admin/security/login-attempts",
          current: location.pathname === "/admin/security/login-attempts",
        },
        {
          name: "Audit Logs",
          href: "/admin/security/audit-logs",
          current: location.pathname === "/admin/security/audit-logs",
        },
      ],
    },
    {
      name: "System Health",
      href: "/admin/system",
      icon: FiActivity,
      current: location.pathname.startsWith("/admin/system"),
      children: [
        {
          name: "Health Monitor",
          href: "/admin/system",
          current: location.pathname === "/admin/system",
        },
        {
          name: "Settings",
          href: "/admin/system/settings",
          current: location.pathname === "/admin/system/settings",
        },
      ],
    },
  ];

  // Super admin only navigation items (reserved for future expansion)
  const superAdminNavigation = [
    // Reserved for future super admin exclusive features
  ];

  const NavItem = ({ item, isChild = false }) => {
    const baseClasses = `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isChild ? "ml-6 pl-8" : ""
    }`;

    const activeClasses = item.current
      ? "bg-purple-100 text-purple-900 border-r-2 border-purple-600"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900";

    return (
      <Link to={item.href} className={`${baseClasses} ${activeClasses}`}>
        {!isChild && <item.icon className="mr-3 h-5 w-5" />}
        {item.name}
        {item.current && !isChild && (
          <div className="ml-auto w-2 h-2 bg-purple-600 rounded-full"></div>
        )}
      </Link>
    );
  };

  return (
    <div className="fixed top-16 left-0 w-64 h-full bg-white border-r border-gray-200 overflow-y-auto z-20">
      <div className="p-4">
        {/* Main Navigation */}
        <nav className="space-y-2">
          <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main
            </h3>
            <div className="mt-2 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <NavItem item={item} />
                  {item.children && item.current && (
                    <div className="mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavItem key={child.name} item={child} isChild />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Super Admin Section - Reserved for future expansion */}
          {isSuperAdmin && superAdminNavigation.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center px-3 mb-2">
                <FiLock className="w-4 h-4 text-red-500 mr-2" />
                <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider">
                  Super Admin
                </h3>
              </div>
              <div className="space-y-1">
                {superAdminNavigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Quick Stats
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users</span>
                <span className="font-medium text-gray-900">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Files</span>
                <span className="font-medium text-gray-900">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage Used</span>
                <span className="font-medium text-gray-900">-- GB</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-green-900">
                System Healthy
              </span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              All services operational
            </p>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;

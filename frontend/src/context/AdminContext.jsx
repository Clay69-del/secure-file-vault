import React, { createContext, useContext } from "react";
import { UserContext } from "./UserContext";

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user } = useContext(UserContext);

  // Check if user has admin privileges
  const isAdmin = user && ["admin", "super_admin"].includes(user.role);
  const isSuperAdmin = user && user.role === "super_admin";
  const canAccessAdmin = user && user.status === "active" && isAdmin;

  // Admin-specific functions
  const checkAdminPermission = (requiredRole = "admin") => {
    if (!user || user.status !== "active") return false;

    if (requiredRole === "super_admin") {
      return user.role === "super_admin";
    }

    return ["admin", "super_admin"].includes(user.role);
  };

  const value = {
    isAdmin,
    isSuperAdmin,
    canAccessAdmin,
    checkAdminPermission,
    adminUser: user,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

// Custom hook for using admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

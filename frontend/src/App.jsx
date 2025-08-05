// secure-file-vault-frontend/src/App.jsx
import { useState, useEffect, useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { UserProvider, UserContext } from "./context/UserContext";
import { AdminProvider } from "./context/AdminContext";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Blog from "./components/Blog";
import ArticleDetail from "./components/ArticleDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./components/Dashboard";
import FileUpload from "./components/Upload";
import Profile from "./components/Profile";
import YourFiles from "./components/YourFile";
import SharedFiles from "./components/SharedFiles";
import SecuritySettings from "./components/SecuritySettings";
import ActivityLog from "./components/ActivityLog";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/Dashboard/AdminDashboard";
import AdminAnalytics from "./components/admin/Analytics/AdminAnalytics";
import EnhancedAnalytics from "./components/admin/Analytics/EnhancedAnalytics";
import UserManagement from "./components/admin/UserManagement/UserManagement";
import SystemSettings from "./components/admin/System/SystemSettings";
import SystemHealth from "./components/admin/System/SystemHealth";
import SecurityDashboard from "./components/admin/Security/SecurityDashboard";
import LoginAttempts from "./components/admin/Security/LoginAttempts";
import AuditLogs from "./components/admin/Security/AuditLogs";
import FileManagement from "./components/admin/Files/FileManagement";
import "react-toastify/dist/ReactToastify.css";
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isCheckingAuth || loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin animation-delay-150"></div>
          </div>
          <p className="text-white text-lg font-medium">
            Loading Secure File Vault...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppLayout = ({ children }) => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const isAuthPage = ["/login", "/register", "/reset-password"].includes(
    location.pathname
  );

  if (isAuthPage) {
    return children;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {user && <Sidebar />}
      <main className={`transition-all duration-300 ${user ? "ml-64" : ""}`}>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <div className="min-h-screen">
                <Navbar />
                <div className="pt-16">
                  <Home />
                </div>
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div className="min-h-screen">
                <Navbar />
                <div className="pt-16">
                  <About />
                </div>
              </div>
            }
          />
          <Route
            path="/contact"
            element={
              <div className="min-h-screen">
                <Navbar />
                <div className="pt-16">
                  <Contact />
                </div>
              </div>
            }
          />
          <Route
            path="/blog"
            element={
              <div className="min-h-screen">
                <Navbar />
                <div className="pt-16">
                  <Blog />
                </div>
              </div>
            }
          />
          <Route
            path="/blog/:id"
            element={
              <div className="min-h-screen">
                <Navbar />
                <div className="pt-16">
                  <ArticleDetail />
                </div>
              </div>
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <Sidebar />
                  <main className="ml-64 pt-16 transition-all duration-300">
                    <Dashboard />
                  </main>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <Sidebar />
                  <main className="ml-64 pt-16 transition-all duration-300">
                    <FileUpload />
                  </main>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <Sidebar />
                  <main className="ml-64 pt-16 transition-all duration-300">
                    <Profile />
                  </main>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/files"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <Sidebar />
                  <main className="ml-64 pt-16 transition-all duration-300">
                    <YourFiles />
                  </main>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/shared"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <Sidebar />
                  <main className="ml-64 pt-16 transition-all duration-300">
                    <SharedFiles />
                  </main>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/security"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <Sidebar />
                  <main className="ml-64 pt-16 transition-all duration-300">
                    <SecuritySettings />
                  </main>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <PrivateRoute>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <Sidebar />
                  <main className="ml-64 pt-16 transition-all duration-300">
                    <ActivityLog />
                  </main>
                </div>
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="analytics/enhanced" element={<EnhancedAnalytics />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="files" element={<FileManagement />} />
            <Route path="security" element={<SecurityDashboard />} />
            <Route path="security/login-attempts" element={<LoginAttempts />} />
            <Route path="security/audit-logs" element={<AuditLogs />} />
            <Route path="system" element={<SystemHealth />} />
            <Route path="system/settings" element={<SystemSettings />} />
            <Route path="system/health" element={<SystemHealth />} />
          </Route>
        </Routes>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />
    </>
  );
}

export default App;

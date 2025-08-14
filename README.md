# Secure File Vault
=======
# Secure File Vaut - Secure File Vault

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Encryption-AES--256--CBC-red?style=for-the-badge&logo=shield&logoColor=white" alt="Encryption" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</div>

## 🛡️ Overview

<<<<<<< HEAD
**Secure File Vault** is a comprehensive, enterprise-grade secure cloud storage and file management platform built with privacy-first principles. It provides end-to-end encrypted file storage, advanced admin controls, comprehensive audit logging, and robust user management capabilities. The platform leverages modern security standards to ensure complete data protection and privacy.
=======
**Secure File Vaut** is a comprehensive, enterprise-grade secure cloud storage and file management platform built with privacy-first principles. It provides end-to-end encrypted file storage, advanced admin controls, comprehensive audit logging, and robust user management capabilities. The platform leverages modern security standards to ensure complete data protection and privacy.
>>>>>>> c6c7e127736143edfc82d5b6faf38b410c0f18a9

### 🎯 Key Highlights

- **Military-grade AES-256-CBC encryption** with per-file IVs
- **Comprehensive admin dashboard** with analytics and system monitoring
- **Advanced audit logging** for compliance and security tracking
- **Multi-authentication** support (OAuth 2.0 + Email/Password)
- **Real-time system health monitoring** and maintenance tools
- **Role-based access control** (User, Admin, Super Admin)

---

## ✨ Features

### 🔐 **Core Security**

- **End-to-End Encryption**: Files encrypted with AES-256-CBC, unique IV per file
- **Zero-Knowledge Architecture**: Server cannot decrypt user files
- **Multi-Factor Authentication**: Google OAuth 2.0 + Email/Password
- **JWT Token Management**: Secure session handling with configurable expiration
- **Rate Limiting**: Comprehensive protection against brute-force attacks
- **Input Validation & Sanitization**: All user inputs validated and sanitized

### 📁 **File Management**

- **Secure Upload**: Files up to 50MB with real-time progress tracking
- **Smart Preview**: In-browser preview for images, PDFs, and documents
- **Bulk Operations**: Multi-file selection and batch actions
- **Advanced Search**: Filter files by name, type, date, and size
- **Grid/List Views**: Flexible file display options
- **Version History**: Track file modifications (coming soon)

### 👥 **User Experience**

- **Intuitive Dashboard**: Modern, responsive interface with real-time stats
- **Profile Management**: Update personal info, profile pictures, and passwords
- **Activity Tracking**: Comprehensive user activity logs
- **Security Settings**: Granular privacy controls and security preferences
- **Responsive Design**: Mobile-first design with Tailwind CSS

### 🛠️ **Administrative Controls**

#### **Admin Dashboard**

- **Real-time Analytics**: User growth, file uploads, storage usage trends
- **System Health Monitoring**: Database performance, memory usage, error rates
- **User Management**: View, suspend, promote, and manage user accounts
- **File Administration**: Monitor, preview, and manage all system files

#### **Security & Audit**

- **Login Attempt Monitoring**: Track successful/failed authentication attempts
- **Comprehensive Audit Logs**: All admin actions logged with severity levels
- **Security Dashboard**: Real-time security metrics and threat assessment
- **IP-based Monitoring**: Track user activity by location and device

#### **System Maintenance**

- **Data Cleanup Tools**: Automated cleanup of old logs and inactive accounts
- **System Backup**: Automated backup creation with file inclusion options
- **Maintenance Mode**: System-wide maintenance with custom messaging
- **Performance Analytics**: Database query optimization and response time monitoring

#### **Settings Management**

- **System Configuration**: Centralized settings management
- **File Upload Limits**: Configurable file size and type restrictions
- **Security Policies**: Customizable password policies and session timeouts
- **User Registration**: Toggle registration availability

### 🔧 **Developer Features**

- **RESTful API**: Comprehensive API with Swagger documentation
- **Modular Architecture**: Clean separation of concerns
- **Extensive Logging**: Detailed logging for debugging and monitoring
- **Environment Configuration**: Flexible deployment configuration
- **Database Agnostic**: Support for PostgreSQL, MySQL, and SQLite

---

## 🏗️ Tech Stack

### **Frontend**

- **Framework**: React 19.1.0 with hooks and context
- **Build Tool**: Vite 7.0.0 for fast development and building
- **Routing**: React Router DOM 7.6.3 for SPA navigation
- **Styling**: Tailwind CSS 3.4.0 + custom components
- **Icons**: React Icons 5.5.0 for comprehensive icon library
- **HTTP Client**: Axios 1.10.0 with interceptors and error handling
- **Notifications**: React Toastify 11.0.5 for user feedback
- **Authentication**: React OAuth Google 0.12.2

### **Backend**

- **Runtime**: Node.js with Express 5.1.0 framework
- **Database**: Sequelize 6.37.1 ORM (PostgreSQL/MySQL/SQLite)
- **Authentication**:
  - Passport.js with Google OAuth 2.0 strategy
  - JWT (jsonwebtoken 9.0.2) for session management
  - bcryptjs 3.0.2 for password hashing
- **File Processing**: Multer 2.0.1 for file uploads
- **Security**:
  - Node.js crypto module for AES-256-CBC encryption
  - Express Rate Limit 8.0.1 for DDoS protection
  - CORS configuration for cross-origin requests
- **Documentation**: Swagger UI Express 5.0.1 with JSDoc
- **Development**: Nodemon 3.1.0 for hot reloading

### **Security & Encryption**

- **File Encryption**: AES-256-CBC with random IV per file
- **Password Hashing**: bcrypt with configurable salt rounds
- **Token Security**: JWT with configurable expiration
- **Request Validation**: Comprehensive input sanitization
- **Rate Limiting**: Multi-level protection against abuse

---

## 📂 Project Structure

```shell
secure-file-vault/
├── 📁 backend/                    # Node.js/Express API Server
│   ├── 📁 controllers/            # Route handlers and business logic
│   │   ├── adminDashboardController.js    # Admin dashboard & analytics
│   │   ├── adminManagementController.js   # Admin user management
│   │   ├── adminMaintenanceController.js  # System maintenance
│   │   ├── adminSettingsController.js     # System settings
│   │   ├── adminUserController.js         # User administration
│   │   ├── authController.js              # Authentication logic
│   │   ├── fileController.js              # File operations
│   │   └── userController.js              # User profile management
│   ├── 📁 middleware/             # Express middleware
│   │   ├── adminMiddleware.js             # Admin access control
│   │   ├── auditLogger.js                 # Audit logging system
│   │   ├── authMiddleware.js              # JWT authentication
│   │   ├── rateLimiter.js                 # Request rate limiting
│   │   └── userActivityLogger.js          # User activity tracking
│   ├── 📁 models/                 # Database models (Sequelize)
│   │   ├── AdminLog.js                    # Admin action logs
│   │   ├── File.js                        # File metadata
│   │   ├── LoginAttempt.js                # Authentication attempts
│   │   ├── SystemSettings.js              # Application settings
│   │   ├── User.js                        # User accounts
│   │   ├── UserActivity.js                # User activity logs
│   │   └── index.js                       # Model associations
│   ├── 📁 routes/                 # API route definitions
│   │   ├── adminRoutes.js                 # Admin panel routes
│   │   ├── authRoutes.js                  # Authentication routes
│   │   ├── fileRoutes.js                  # File management routes
│   │   └── userRoutes.js                  # User profile routes
│   ├── 📁 scripts/                # Utility scripts
│   │   ├── promoteAdmin.js                # Admin promotion script
│   │   └── testAdminSystem.js             # Admin system testing
│   ├── 📁 seeders/                # Database seeders
│   │   └── adminSeeder.js                 # Default admin & settings
│   ├── 📁 uploads/                # Encrypted file storage
│   │   └── profile-pictures/              # User profile images
│   ├── package.json               # Dependencies and scripts
│   ├── server.js                  # Express server configuration
│   └── passport.js                # Passport authentication config
│
├── 📁 frontend/                   # React + Vite Client Application
│   ├── 📁 src/
│   │   ├── 📁 components/         # React components
│   │   │   ├── 📁 admin/          # Admin panel components
│   │   │   │   ├── 📁 Analytics/          # Analytics dashboards
│   │   │   │   ├── 📁 Dashboard/          # Admin dashboard
│   │   │   │   ├── 📁 Files/              # File management
│   │   │   │   ├── 📁 Security/           # Security monitoring
│   │   │   │   ├── 📁 System/             # System maintenance
│   │   │   │   ├── 📁 UserManagement/     # User administration
│   │   │   │   ├── AdminLayout.jsx        # Admin layout wrapper
│   │   │   │   ├── AdminNavbar.jsx        # Admin navigation
│   │   │   │   ├── AdminRoute.jsx         # Admin route protection
│   │   │   │   └── AdminSidebar.jsx       # Admin sidebar
│   │   │   ├── About.jsx                  # About page
│   │   │   ├── ActivityLog.jsx            # User activity display
│   │   │   ├── Blog.jsx                   # Blog/Articles
│   │   │   ├── Contact.jsx                # Contact page
│   │   │   ├── Dashboard.jsx              # User dashboard
│   │   │   ├── Home.jsx                   # Landing page
│   │   │   ├── Login.jsx                  # Login form
│   │   │   ├── Navbar.jsx                 # Main navigation
│   │   │   ├── Profile.jsx                # User profile
│   │   │   ├── Register.jsx               # Registration form
│   │   │   ├── SecuritySettings.jsx       # Security preferences
│   │   │   ├── SharedFiles.jsx            # Shared files (coming soon)
│   │   │   ├── Upload.jsx                 # File upload interface
│   │   │   └── YourFile.jsx               # File management
│   │   ├── 📁 context/            # React context providers
│   │   │   ├── AdminContext.jsx           # Admin state management
│   │   │   └── UserContext.jsx            # User authentication state
│   │   ├── 📁 styles/             # CSS stylesheets
│   │   ├── 📁 utils/              # Utility functions
│   │   │   ├── adminApi.js                # Admin API client
│   │   │   └── api.js                     # Main API client
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # React app entry point
│   ├── package.json               # Frontend dependencies
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   ├── vite.config.js             # Vite build configuration
│   └── vercel.json                # Vercel deployment config
│
└── README.md                      # Project documentation
```

---

## 🚀 Getting Started

### **Prerequisites**

- **Node.js** v18+ (recommended v20+)
- **npm** or **yarn** package manager
- **Database**: PostgreSQL (recommended) / MySQL / SQLite
- **Git** for version control

### **1. Clone the Repository**

```bash
git clone https://github.com/Clay69-del/secure-file-vault.git
cd secure-file-vault
```

### **2. Backend Setup**

```bash
cd backend
npm install

# Create environment configuration
cp .env.example .env
# Edit .env with your configuration (see below)

# Start the server
npm start
# or for development with auto-reload
npm run dev
```

#### **Backend Environment Variables** (`.env`)

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (choose one)
<<<<<<< HEAD
DATABASE_URL=postgresql://username:password@localhost:5432/securefilevault
# or for MySQL
# DATABASE_URL=mysql://username:password@localhost:3306/securefilevault
=======
DATABASE_URL=postgresql://username:password@localhost:5432/Secure File Vaut
# or for MySQL
# DATABASE_URL=mysql://username:password@localhost:3306/Secure File Vaut
>>>>>>> c6c7e127736143edfc82d5b6faf38b410c0f18a9
# or for SQLite (development)
# DATABASE_URL=sqlite:./database.sqlite

# Security Keys
JWT_SECRET=your_super_secret_jwt_key_here
ENCRYPTION_KEY=your_64_character_hex_encryption_key  # Generate with: openssl rand -hex 32
IV=your_32_character_hex_iv                          # Generate with: openssl rand -hex 16

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Admin Configuration
<<<<<<< HEAD
ADMIN_EMAIL=admin@securefilevault.com
=======
ADMIN_EMAIL=admin@Secure File Vaut.com
>>>>>>> c6c7e127736143edfc82d5b6faf38b410c0f18a9
ADMIN_DEFAULT_PASSWORD=change_this_password
```

### **3. Frontend Setup**

```bash
cd ../frontend
npm install

# Create environment configuration
echo "VITE_BACKEND_URL=http://localhost:5000" > .env
echo "VITE_GOOGLE_CLIENT_ID=your_google_client_id" >> .env

# Start development server
npm run dev
```

### **4. First Run Setup**

1. **Access the application**: `http://localhost:5173`
2. **Default Super Admin**:
<<<<<<< HEAD
   - Email: `admin@securefilevault.com` (or your `ADMIN_EMAIL`)
=======
   - Email: `admin@Secure File Vaut.com` (or your `ADMIN_EMAIL`)
>>>>>>> c6c7e127736143edfc82d5b6faf38b410c0f18a9
   - Password: `change_this_password` (or your `ADMIN_DEFAULT_PASSWORD`)
3. **⚠️ IMPORTANT**: Change the default admin password immediately after first login!

---

## 📖 API Documentation

### **Authentication Endpoints**

```shell
POST   /api/auth/register           # Create new user account
POST   /api/auth/login              # Email/password authentication
POST   /api/auth/google-auth        # Google OAuth authentication
POST   /api/auth/request-reset      # Request password reset
POST   /api/auth/reset-password     # Reset password with token
POST   /api/auth/logout             # Logout user
```

### **File Management**

```shell
GET    /api/files                   # List user's files
POST   /api/files/upload            # Upload new file (multipart/form-data)
GET    /api/files/view/:id          # Download/preview file
DELETE /api/files/:id               # Delete file
```

### **User Profile**

```shell
GET    /api/users/me                # Get user profile
PUT    /api/users/me                # Update profile information
POST   /api/users/me/profile-picture # Upload profile picture
PUT    /api/users/me/password       # Change password
GET    /api/users/me/activity       # Get user activity history
```

### **Admin Panel** (Admin/Super Admin only)

```shell
GET    /api/admin/dashboard         # Dashboard statistics
GET    /api/admin/users             # User management
GET    /api/admin/files             # File administration
GET    /api/admin/security/audit-logs # Audit logs
GET    /api/admin/analytics         # System analytics
POST   /api/admin/maintenance       # System maintenance
```

**🔐 Authentication**: All protected routes require `Authorization: Bearer <jwt_token>` header

**📊 Interactive API Documentation**: Available at `http://localhost:5000/api-docs` when server is running

---

## 🔒 Security Architecture

### **Encryption Implementation**

- **Algorithm**: AES-256-CBC (Advanced Encryption Standard)
- **Key Management**: Server-side encryption keys with environment variable storage
- **IV Generation**: Cryptographically secure random IV per file
- **File Processing**: Streaming encryption/decryption for memory efficiency

### **Authentication Flow**

1. **Registration**: bcrypt password hashing (10 rounds)
2. **Login**: JWT token generation with configurable expiration
3. **Google OAuth**: Secure OAuth 2.0 flow with token verification
4. **Session Management**: Stateless JWT with secure headers

### **Security Measures**

- **Rate Limiting**: Progressive delays for repeated failed attempts
- **Input Validation**: Comprehensive data sanitization
- **CORS Protection**: Configured cross-origin request handling
- **File Type Validation**: Whitelist-based file type checking
- **Audit Logging**: All security events tracked with severity levels

---

## 👥 User Roles & Permissions

### **🔵 User** (Default Role)

- Upload, download, and manage own files
- Update profile and change password
- View personal activity history
- Access security settings

### **🟡 Admin**

- All User permissions
- View and manage all users
- Monitor system files
- Access audit logs and analytics
- Perform user account actions (suspend/unsuspend)

### **🔴 Super Admin**

- All Admin permissions
- Create/promote/demote admin users
- System maintenance operations
- Backup and cleanup operations
- Modify system settings
- Toggle maintenance mode

---

## 📊 Monitoring & Analytics

### **System Health Monitoring**

- **Database Performance**: Query response times and connection pool status
- **Memory Usage**: Real-time memory consumption tracking
- **Error Rate Monitoring**: Automatic error detection and alerting
- **File Operations**: Upload/download success rates and performance

### **User Analytics**

- **Growth Metrics**: User registration and retention rates
- **Usage Patterns**: File upload trends and storage utilization
- **Geographic Distribution**: User location analytics (IP-based)
- **Activity Tracking**: Login patterns and feature usage

### **Security Analytics**

- **Login Attempt Analysis**: Success/failure rates and suspicious activity
- **Audit Trail**: Comprehensive admin action logging
- **Threat Assessment**: Automated security risk evaluation
- **Compliance Reporting**: GDPR-ready audit log exports

---

## 🚀 Deployment

### **Frontend Deployment** (Static Hosting)

**Vercel** (Recommended):

```bash
cd frontend
npm run build
# Deploy to Vercel using their CLI or GitHub integration
```

**Netlify**:

```bash
cd frontend
npm run build
# Deploy dist/ folder to Netlify
```

### **Backend Deployment** (Node.js Hosting)

**Render** (Recommended):

```bash
# Connect GitHub repo to Render
# Set environment variables in Render dashboard
# Auto-deploy on git push
```

**Railway**:

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up
```

### **Database Deployment**

- **Production**: PostgreSQL (Render, Railway, or AWS RDS)
- **Development**: SQLite (included in repository)

### **Environment Variables for Production**

Ensure all environment variables are properly set in your hosting platform:

- Database connection strings
- JWT secrets and encryption keys
- Google OAuth credentials
- Admin account configuration

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### **Development Setup**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper commit messages
4. Add tests for new functionality
5. Update documentation as needed
6. Submit a pull request

### **Code Standards**

- **Frontend**: ESLint configuration with React best practices
- **Backend**: Clean architecture with proper error handling
- **Database**: Proper migrations for schema changes
- **Security**: Security review required for auth/encryption changes

### **Pull Request Process**

1. Ensure all tests pass
2. Update README.md with details of changes
3. Increase version numbers following semantic versioning
4. Admin approval required for security-related changes

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Documentation

<<<<<<< HEAD
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/Clay69-del/Secure_File_Vault/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/Clay69-del/Secure_File_Vault/discussions)
- **📚 Wiki**: [Project Wiki](https://github.com/Clay69-del/Secure_File_Vault/wiki)
- **📧 Contact**: [support@Secure_File_Vault.com](mailto:support@Secure_File_Vault.com)
=======
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/Clay69-del/Secure File Vaut/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/Clay69-del/Secure File Vaut/discussions)
- **📚 Wiki**: [Project Wiki](https://github.com/Clay69-del/Secure File Vaut/wiki)
- **📧 Contact**: [support@Secure File Vaut.com](mailto:support@Secure File Vaut.com)
>>>>>>> c6c7e127736143edfc82d5b6faf38b410c0f18a9

---

## 🔄 Changelog

### **v1.0.0** (Current)

- ✅ Complete file encryption system with AES-256-CBC
- ✅ Comprehensive admin panel with analytics
- ✅ Google OAuth 2.0 integration
- ✅ Real-time system monitoring
- ✅ Audit logging and compliance features
- ✅ Role-based access control
- ✅ Responsive React frontend with Tailwind CSS

### **Upcoming Features** (v1.1.0)

- 🔄 File sharing with encrypted links
- 🔄 Team collaboration features
- 🔄 Advanced file versioning
- 🔄 Email notifications system
- 🔄 Mobile application

---

<div align="center">
  <h3>Built with ❤️ for privacy and security</h3>
<<<<<<< HEAD
  <p>Secure_File_Vault - Where your files are truly safe</p>
=======
  <p>Secure File Vaut - Where your files are truly safe</p>
>>>>>>> c6c7e127736143edfc82d5b6faf38b410c0f18a9
</div>

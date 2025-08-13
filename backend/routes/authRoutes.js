// server.js or your route file
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authMiddleware from '../middleware/authMiddleware.js';
import { register, login, logout, requestPasswordReset, resetPassword, googleAuthLogin, verifyEmail } from '../controllers/authController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Auth endpoints
router.get('/health', (req, res) => res.json({ message: 'Server is running' }));
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/google-auth', googleAuthLogin);
router.get('/verify-email', verifyEmail);

export default router;
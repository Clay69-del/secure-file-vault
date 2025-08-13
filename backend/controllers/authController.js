import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { Op } from "sequelize";
import crypto from "crypto";
import {
  logUserActivity,
  USER_ACTIONS,
  TARGET_TYPES,
} from "../middleware/userActivityLogger.js";
import { sendVerificationEmail } from "../utils/emailService.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Simple validation helper
function validateEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}
function validatePassword(password) {
  return typeof password === "string" && password.length >= 6;
}
function validateName(name) {
  return typeof name === "string" && name.trim().length > 0;
}

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!validateName(name)) {
    return res.status(400).json({ error: "Invalid name" });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (!validatePassword(password)) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour from now

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      verificationToken,
      verificationTokenExpires,
    });
    console.log("User created in DB:", JSON.stringify(user, null, 2));

    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Registration failed" });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Verification token is missing." });
  }

  try {
    const user = await User.findOne({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid verification token." });
    }

    if (user.emailVerified) {
      return res.status(200).json({ message: "Email has already been verified." });
    }

    if (user.verificationTokenExpires < new Date()) {
      return res.status(400).json({ error: "Expired verification token." });
    }

    user.emailVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Email verification failed." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    console.error("Missing email or password in login request");
    return res.status(400).json({ error: "Email and password required" });
  }

  if (!validateEmail(email)) {
    console.error("Invalid email format:", email);
    return res.status(400).json({ error: "Invalid email" });
  }

  if (!validatePassword(password)) {
    console.error("Invalid password length");
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error("No user found with email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ error: "Please verify your email address." });
    }

    if (!user.password) {
      console.error(
        "User has no password set (possibly registered with Google)"
      );
      return res.status(401).json({ error: "Please sign in with Google" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = generateToken(user);

    // Log the login activity
    await logUserActivity(
      user.id,
      USER_ACTIONS.LOGIN,
      TARGET_TYPES.SYSTEM,
      {
        details: {
          loginMethod: "email",
        },
      },
      req
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Here you would generate a reset token and send an email
    // For now, just return a success message
    res.status(200).json({ message: "Password reset link sent (stub)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not process password reset" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (
    !email ||
    !validateEmail(email) ||
    !validatePassword(oldPassword) ||
    !validatePassword(newPassword)
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.password) {
      return res
        .status(404)
        .json({ error: "User not found or password not set" });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not reset password" });
  }
};

export const logout = async (req, res) => {
  // For JWT, logout is handled client-side by deleting the token. Optionally, you can blacklist tokens here.
  res.status(200).json({ message: "Logged out successfully" });
};

export const googleAuthLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: "Google credential is required" });
  }

  try {
    // Decode the JWT token to get user info
    const decoded = jwt.decode(credential);

    if (!decoded || !decoded.email) {
      return res
        .status(400)
        .json({ error: "Invalid Google token: missing email" });
    }

    const { email, name, picture, sub: googleId } = decoded;

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        googleId: googleId || "",
        name: name || "User",
        email,
        picture: picture || "",
        emailVerified: true, // Google users are considered verified
      });
    }

    // Generate JWT with user info
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        emailVerified: user.emailVerified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Log the login activity
    await logUserActivity(
      user.id,
      USER_ACTIONS.LOGIN,
      TARGET_TYPES.SYSTEM,
      {
        details: {
          loginMethod: "google",
        },
      },
      req
    );

    // Return token and user to frontend in the expected format
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};
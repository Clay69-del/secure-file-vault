import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (to, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Verify Your Email for Secure File Vault',
    html: `
      <p>Hello,</p>
      <p>Thank you for registering with Secure File Vault. Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationLink}">Verify Email Address</a></p>
      <p>If you did not register for this service, please ignore this email.</p>
      <p>Best regards,</p>
      <p>Secure File Vault Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to ' + to);
  } catch (error) {
    console.error('Error sending verification email to ' + to + ':', error);
    throw new Error('Failed to send verification email.');
  }
};

export { sendVerificationEmail };

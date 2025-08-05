import React, { useState } from 'react';
import { FiMail, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../utils/api';
import '../styles/forms.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 for email, 2 for token/password
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    
    try {
      await api.post('/auth/request-reset', { email });
      setMessage('Password reset email sent. Please check your inbox for the reset token.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setMessage('Password has been successfully reset. You can now log in with your new password.');
      // Optional: redirect to login after a delay
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="form-container">
        {step === 1 ? (
          <>
            <div className="form-header">
              <h2>Reset Password</h2>
              <p>Enter your email to receive a reset token</p>
            </div>
            
            {error && (
              <div className="error-message">
                <FiAlertCircle className="text-xl" />
                <span>{error}</span>
              </div>
            )}
            
            {message && (
              <div className="success-message">
                <FiCheckCircle className="text-xl" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  className={`btn btn-primary w-full ${isLoading ? 'btn-loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="form-header">
              <h2>Enter New Password</h2>
              <p>Enter the token from your email and a new password</p>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="form-group">
                <label htmlFor="token">Reset Token</label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="form-control"
                  placeholder="Paste your token here"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-control"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  className={`btn btn-primary w-full ${isLoading ? 'btn-loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

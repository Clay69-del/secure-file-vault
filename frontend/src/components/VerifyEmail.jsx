import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

function VerifyEmail() {
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (!token) {
      setVerificationStatus('error');
      setMessage('No verification token found.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setVerificationStatus('success');
        setMessage(response.data.message || 'Your email has been successfully verified!');
      } catch (error) {
        setVerificationStatus('error');
        setMessage(error.response?.data?.error || 'Email verification failed. The link might be invalid or expired.');
      }
    };

    verifyToken();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        {verificationStatus === 'loading' && (
          <div className="flex flex-col items-center">
            <FiLoader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">Verifying your email...</h2>
            <p className="text-gray-600 mt-2">Please wait, this may take a moment.</p>
          </div>
        )}

        {verificationStatus === 'success' && (
          <div className="flex flex-col items-center">
            <FiCheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">Verification Successful!</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Go to Login
            </Link>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="flex flex-col items-center">
            <FiXCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800">Verification Failed</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Try Registering Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;

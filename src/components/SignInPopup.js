import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function SignInPopup({ isOpen, onClose, onSwitchToSignUp }) {
  const popupRef = useRef(null);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState(''); // success or error message
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.emailOrPhone,
        password: formData.password,
      });

      if (error) {
        setError('Incorrect email or password');
      } else {
        setError('');
        onClose();  // Close popup
        window.location.reload(); // Refresh page after sign in
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input change
  };

  // Forgot Password handlers
  const openForgotModal = () => {
    setForgotEmail('');
    setForgotStatus('');
    setShowForgotModal(true);
  };
  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotStatus('');
    setForgotLoading(false);
  };
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotStatus('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin + '/reset-password', 
      });
      if (error) {
        setForgotStatus('Error: ' + error.message);
      } else {
        setForgotStatus('Success! Check your email for a reset link.');
      }
    } catch (err) {
      setForgotStatus('Unexpected error.');
    }
    setForgotLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Sign In to Poly Bites
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-center mb-2">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              id="emailOrPhone"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Forgot Password */}
          <button
            type="button"
            className="text-green-600 hover:text-green-700 text-sm font-medium"
            onClick={openForgotModal}
          >
            Forgot Password?
          </button>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Sign In
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Sign Up
            </button>
          </p>
        </form>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative shadow-lg">
              <button
                onClick={closeForgotModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Reset Password</h3>
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter your email address
                  </label>
                  <input
                    type="email"
                    id="forgotEmail"
                    name="forgotEmail"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                {forgotStatus && (
                  <div className={`text-center text-sm ${forgotStatus.startsWith('Success') ? 'text-green-600' : 'text-red-600'}`}>{forgotStatus}</div>
                )}
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
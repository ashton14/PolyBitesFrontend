import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ResetPassword() {
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionSet, setSessionSet] = useState(false);

  // Parse tokens from URL hash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const at = hashParams.get('access_token') || '';
      const rt = hashParams.get('refresh_token') || '';
      setAccessToken(at);
      setRefreshToken(rt);
    }
  }, []);

  // Set session with tokens
  useEffect(() => {
    const setSession = async () => {
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setStatus('Error authenticating reset link: ' + error.message);
        } else {
          setSessionSet(true);
        }
      }
    };
    if (accessToken && refreshToken) {
      setSession();
    }
  }, [accessToken, refreshToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (password !== confirmPassword) {
      setStatus('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setStatus('Error updating password: ' + error.message);
      } else {
        setStatus('Password updated! You can now sign in with your new password.');
      }
    } catch (err) {
      setStatus('Unexpected error.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 min-h-screen">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Reset Your Password</h2>
        {!sessionSet ? (
          <div className="text-center text-gray-600">Validating reset link...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter new password"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Confirm new password"
                required
              />
            </div>
            {status && (
              <div className={`text-center text-sm ${status.startsWith('Password updated') ? 'text-green-600' : 'text-red-600'}`}>{status}</div>
            )}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Filter } from 'bad-words'

export default function SignUpPopup({ isOpen, onClose, onSwitchToSignIn }) {
  const popupRef = useRef(null);
  const filter = new Filter();

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

  const [formData, setFormData] = useState({
    fullName: '',
    emailOrPhone: '',
    password: '',
    confirmPassword: ''
  });

  const checkUserExists = async (email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/profiles/check-user?email=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.exists;
      } else {
        console.error('Error checking user existence:', response.statusText);
        return false; // If check fails, allow signup to proceed
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false; // If check fails, allow signup to proceed
    }
  };

  const createProfile = async (userId) => {
    try {
      // Add a small delay to ensure the auth user is properly created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch('http://localhost:5000/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          auth_id: userId
        }),
      });

      if (response.ok) {
        const profileData = await response.json();
        return profileData;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for profanity in username
    if (filter.isProfane(formData.fullName)) {
      alert('Name contains inappropriate language. Please choose a different name.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      // 0. Check if user already exists
      const userExists = await checkUserExists(formData.emailOrPhone);
      if (userExists) {
        alert('An account with this email already exists. Please try signing in instead.');
        return;
      }

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.emailOrPhone,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) {
        console.error('Signup error:', authError.message);
        alert(authError.message);
        return;
      }

      // 2. Create profile in our database
      try {
        const profileData = await createProfile(authData.user.id);
        alert('Signup successful! Please verify your email.');
        onClose();
      } catch (profileError) {
        console.error('Profile creation error:', profileError);
        
        // Provide more specific error messages
        if (profileError.message.includes('Invalid auth_id')) {
          alert('Account created but there was a delay in setting up your profile. Please try signing in again in a few moments.');
        } else if (profileError.message.includes('Profile already exists')) {
          alert('A profile already exists for this account. Please try signing in instead.');
        } else {
          alert('Account created but profile setup failed. Please contact support.');
        }
        
        // You might want to delete the auth user here if profile creation fails
        // This would require admin privileges in Supabase
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
          Create Your Account
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

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
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Create Account
          </button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
} 
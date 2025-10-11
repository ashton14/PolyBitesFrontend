import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getApiUrl } from '../config';

export default function ContactForm({ isOpen, onClose, onSignInOpen, initialSubject = '' }) {
  const popupRef = useRef(null);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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

  // Check authentication status when the form opens and set initial subject
  useEffect(() => {
    const checkAuth = async () => {
      if (isOpen) {
        setIsCheckingAuth(true);
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
        setIsCheckingAuth(false);
        
        // Set initial subject if provided
        if (initialSubject) {
          setFormData(prev => ({
            ...prev,
            subject: initialSubject
          }));
        }
      } else {
        // Reset form when closing
        setFormData({ subject: '', message: '' });
        setIsSubmitted(false);
      }
    };
    checkAuth();
  }, [isOpen, initialSubject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Get the current user's profile if logged in
      let userId = null;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch the profile to get the user_id from the profiles table
        const profileResponse = await fetch(getApiUrl(`api/profiles/auth/${user.id}`));
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          userId = profileData.id;
        }
      }
      
      // Send the message to the backend
      const response = await fetch(getApiUrl('api/messages'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: userId,
          subject: formData.subject,
          message: formData.message
        }),
      });
      
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit message');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your message. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setFormData({ subject: '', message: '' });
    onClose();
  };

  const handleSignIn = () => {
    onClose();
    // Small delay to ensure the contact form modal closes before opening sign-in
    setTimeout(() => {
      if (onSignInOpen) {
        onSignInOpen();
      } else {
        console.error('onSignInOpen is not defined');
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={popupRef} className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {isCheckingAuth ? (
          /* Loading state */
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        ) : !isAuthenticated ? (
          /* Sign In Required Message */
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to your account to send us a message.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSignIn}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Sign In
              </button>
              <button
                onClick={handleClose}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : !isSubmitted ? (
          <>
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Contact Us
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="What's this about?"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Tell us what's on your mind..."
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          </>
        ) : (
          /* Success Message */
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-6">
              Your message has been submitted for review. Thank you for your feedback!
            </p>
            <button
              onClick={handleClose}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

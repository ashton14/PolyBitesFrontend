import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onSignInOpen, onSignUpOpen }) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="text-xl sm:text-2xl md:text-3xl font-extrabold animate-fade-in text-black hover:text-green-100 transition-colors"
              onClick={closeMobileMenu}
            >
              PolyBites 🍽️
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <Link
                  to="/about"
                  className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/terms"
                  className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
                >
                  Terms
                </Link>
                <Link
                  to="/faqs"
                  className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
                >
                  FAQs
                </Link>
                <Link
                  to="/profile"
                  className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="bg-white text-green-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/terms"
                  className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
                >
                  Terms
                </Link>
                <Link
                  to="/faqs"
                  className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
                >
                  FAQs
                </Link>
                <button
                  onClick={onSignInOpen}
                  className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignUpOpen}
                  className="bg-white text-green-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-green-50 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-green-700 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="py-4 space-y-2 border-t border-green-500">
            <Link
              to="/about"
              className="block px-4 py-3 text-white hover:bg-green-700 transition-colors rounded-lg"
              onClick={closeMobileMenu}
            >
              About
            </Link>
            <Link
              to="/terms"
              className="block px-4 py-3 text-white hover:bg-green-700 transition-colors rounded-lg"
              onClick={closeMobileMenu}
            >
              Terms
            </Link>
            <Link
              to="/faqs"
              className="block px-4 py-3 text-white hover:bg-green-700 transition-colors rounded-lg"
              onClick={closeMobileMenu}
            >
              FAQs
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-3 bg-black text-white hover:bg-gray-800 transition-colors rounded-lg mx-4"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="block w-full text-left px-4 py-3 bg-white text-green-600 hover:bg-green-50 transition-colors rounded-lg mx-4"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onSignInOpen();
                    closeMobileMenu();
                  }}
                  className="block w-full text-left px-4 py-3 bg-black text-white hover:bg-gray-800 transition-colors rounded-lg mx-4"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onSignUpOpen();
                    closeMobileMenu();
                  }}
                  className="block w-full text-left px-4 py-3 bg-white text-green-600 hover:bg-green-50 transition-colors rounded-lg mx-4"
                >
                  Sign Up
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
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
    <header className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-xl fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-sm">
      {/* Subtle top border for depth */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-400 via-white to-teal-400 opacity-40"></div>
      
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo - Enhanced */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
              onClick={closeMobileMenu}
            >
              <span className="text-2xl sm:text-3xl">🍽️</span>
              <span className="text-xl sm:text-2xl md:text-3xl font-bold heading-font text-white group-hover:text-emerald-50 transition-all duration-300" style={{
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                letterSpacing: '-0.02em'
              }}>
                PolyBites
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Enhanced */}
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link
                  to="/about"
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-emerald-50 transition-all duration-200"
                >
                  About
                </Link>
                <Link
                  to="/terms"
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-emerald-50 transition-all duration-200"
                >
                  Terms
                </Link>
                <Link
                  to="/faqs"
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-emerald-50 transition-all duration-200"
                >
                  FAQs
                </Link>
                <div className="w-px h-6 bg-white/20 mx-2"></div>
                <Link
                  to="/profile"
                  className="bg-white/20 backdrop-blur-sm text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition-all duration-200 shadow-lg"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="bg-white text-green-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-emerald-50 transition-all duration-200"
                >
                  About
                </Link>
                <Link
                  to="/terms"
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-emerald-50 transition-all duration-200"
                >
                  Terms
                </Link>
                <Link
                  to="/faqs"
                  className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-emerald-50 transition-all duration-200"
                >
                  FAQs
                </Link>
                <div className="w-px h-6 bg-white/20 mx-2"></div>
                <button
                  onClick={onSignInOpen}
                  className="bg-white/20 backdrop-blur-sm text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white/30 transition-all duration-200 shadow-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignUpOpen}
                  className="bg-white text-green-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
                >
                  Sign Up
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button - Enhanced */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10 transition-all duration-200"
            aria-label="Toggle mobile menu"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu - Enhanced */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="py-4 space-y-2 border-t border-white/20">
            <Link
              to="/about"
              className="block px-4 py-3 text-white hover:bg-white/10 transition-all duration-200 rounded-lg font-medium"
              onClick={closeMobileMenu}
            >
              About
            </Link>
            <Link
              to="/terms"
              className="block px-4 py-3 text-white hover:bg-white/10 transition-all duration-200 rounded-lg font-medium"
              onClick={closeMobileMenu}
            >
              Terms
            </Link>
            <Link
              to="/faqs"
              className="block px-4 py-3 text-white hover:bg-white/10 transition-all duration-200 rounded-lg font-medium"
              onClick={closeMobileMenu}
            >
              FAQs
            </Link>
            
            <div className="h-px bg-white/20 my-2"></div>
            
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-3 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200 rounded-lg mx-2 font-semibold shadow-lg"
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="block w-full text-left px-4 py-3 bg-white text-green-600 hover:bg-emerald-50 transition-all duration-200 rounded-lg mx-2 font-semibold shadow-lg"
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
                  className="block w-full text-left px-4 py-3 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200 rounded-lg mx-2 font-semibold shadow-lg"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onSignUpOpen();
                    closeMobileMenu();
                  }}
                  className="block w-full text-left px-4 py-3 bg-white text-green-600 hover:bg-emerald-50 transition-all duration-200 rounded-lg mx-2 font-semibold shadow-lg"
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
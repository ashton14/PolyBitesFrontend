import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// import userIcon from '../assets/icons/User.png';

export default function Navbar({ onSignInOpen, onSignUpOpen }) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between h-14">
        {/* Logo or App Name */}
        <div className="flex items-center h-full">
          <Link to="/" className="text-3xl font-extrabold animate-fade-in pl-2 text-black hover:text-green-100 transition-colors" style={{marginLeft: '10px'}}>
            PolyBites 🍽️
          </Link>
        </div>

        {/* Right Side */}
        {user ? (
          <div className="flex items-center space-x-2 pr-2">
            <Link
              to="/about"
              className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
              style={{marginRight: 10}}
              >
              About
            </Link>

            <Link
              to="/terms"
              className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
              style={{marginRight: 10}}
              >
              Terms
            </Link>

            <Link
              to="/faqs"
              className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
              style={{marginRight: 10}}
              >
              FAQs
            </Link>
        
            <Link
              to="/profile"
              className="bg-black text-white-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-black-50 transition-colors"
              style={{marginRight: 10}}
              >
              Profile
              {/* <img src={userIcon} alt="Profile" className="w-6 h-6" /> */}
            </Link>
            <button
              onClick={logout}
              className="bg-white text-green-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-green-50 transition-colors"
              style={{marginRight: 10}}
              >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 pr-2">
              <Link
              to="/about"
              className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
              style={{marginRight: 10}}
              >
              About
            </Link>

            <Link
              to="/terms"
              className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
              style={{marginRight: 10}}
              >
              Terms
            </Link>

            <Link
              to="/faqs"
              className="text-white px-4 py-1.5 rounded-full text-sm font-medium hover:text-green-100 transition-colors"
              style={{marginRight: 10}}
              >
              FAQs
            </Link>
            
            <button
              onClick={onSignInOpen}
              className="bg-black text-white-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-black-50 transition-colors"
              style={{marginRight: 10}}
            >
              Sign In
            </button>

            <button
              onClick={onSignUpOpen}
              className="bg-white text-green-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-green-50 transition-colors"
              style={{marginRight: 10}}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ContactForm from './ContactForm';

export default function AboutPage({ onSignInOpen }) {
  const [showContactForm, setShowContactForm] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-green-600 to-green-500 text-white py-16 relative">
        {/* Back to Home Button */}
        <div className="absolute top-6 left-6 z-10">
          <Link 
            to="/" 
            className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">About PolyBites</h1>
          <p className="text-xl opacity-90">Your Guide to Cal Poly Campus Dining</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to PolyBites 🍽️</h2>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg">
              PolyBites is the premier review platform dedicated to Cal Poly's on-campus dining experience. 
              We're here to help students, faculty, and visitors discover the best food options across campus.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-3">What We Do</h3>
                <ul className="space-y-2 text-green-700">
                  <li>• Comprehensive restaurant reviews and ratings</li>
                  <li>• Detailed menu item evaluations</li>
                  <li>• Real-time feedback from the Cal Poly community</li>
                  <li>• Help you make informed dining decisions</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Our Mission</h3>
                <p className="text-blue-700">
                  To create a vibrant community-driven platform that enhances the dining experience 
                  at Cal Poly by providing honest, detailed reviews and helping everyone find their 
                  perfect meal on campus.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Why PolyBites?</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">⭐</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Authentic Reviews</h4>
                  <p className="text-sm text-gray-600">Real reviews from real Cal Poly students and staff</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🍕</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Comprehensive Coverage</h4>
                  <p className="text-sm text-gray-600">Every dining location and menu item reviewed</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">💚</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Community Driven</h4>
                  <p className="text-sm text-gray-600">Built by and for the Cal Poly community</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🚀</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Always Updated</h4>
                  <p className="text-sm text-gray-600">Fresh reviews and ratings updated in real time</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Join Our Community</h3>
              <p className="text-gray-700 mb-4">
                Whether you're a first-year student exploring campus dining options or a faculty member 
                looking for a quick lunch, PolyBites has you covered. Sign up to contribute your own 
                reviews and help others discover the best food on campus.
              </p>
              <Link 
                to="/" 
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Start Exploring
              </Link>
            </div>

            {/* Contact Us Section */}
            <div className="mt-8 p-6 bg-green-50 rounded-lg">
              <h3 className="text-xl font-semibold text-green-800 mb-4">Contact Us</h3>
              <p className="text-green-700 mb-4">
                Have questions, suggestions, or want to contribute to PolyBites? We'd love to hear from you!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <span>📧</span>
                  <span>Contact Us</span>
                </button>
                <a 
                  href="https://github.com/BraedenAlonge/PolyBites" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors"
                >
                  <span>🐙</span>
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={showContactForm} 
        onClose={() => setShowContactForm(false)} 
        onSignInOpen={onSignInOpen}
      />
    </div>
  );
} 
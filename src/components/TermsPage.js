import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactForm from './ContactForm';

export default function TermsPage({ onSignInOpen }) {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-12 relative">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          to="/" 
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-lg"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </div>
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> July 1, 2025
            </p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using PolyBites, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 mb-4">
                PolyBites is a review platform dedicated to Cal Poly's on-campus dining experience. Users can browse restaurants, read reviews, and submit their own reviews and ratings for food items.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Accounts</h2>
              <p className="text-gray-600 mb-4">
                To post reviews, you must create an account with a valid email address. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. User Conduct</h2>
              <p className="text-gray-600 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Post reviews containing profanity, hate speech, or inappropriate content</li>
                <li>Submit false or misleading information</li>
                <li>Impersonate another person or entity</li>
                <li>Use the service for commercial purposes without permission</li>
                <li>Attempt to gain unauthorized access to the service</li>
                <li>Interfere with or disrupt the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Content Guidelines</h2>
              <p className="text-gray-600 mb-4">
                All reviews must be:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                <li>Based on personal experience</li>
                <li>Honest and constructive</li>
                <li>Free of profanity and inappropriate language</li>
                <li>Relevant to the food item or restaurant being reviewed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Privacy Policy</h2>
              <p className="text-gray-600 mb-4">
                Your privacy is important to us. We collect and use your information as described in our Privacy Policy. By using PolyBites, you consent to our collection and use of information as outlined in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                The content on PolyBites, including text, graphics, logos, and software, is the property of PolyBites and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Disclaimers</h2>
              <p className="text-gray-600 mb-4">
                PolyBites is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or usefulness of any information on the service. Reviews represent individual opinions and experiences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                PolyBites shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account at any time for violations of these terms. You may also terminate your account at any time by contacting us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the service. Continued use of PolyBites after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <button
                onClick={() => setShowContactForm(true)}
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Contact Us
              </button>
            </section>
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
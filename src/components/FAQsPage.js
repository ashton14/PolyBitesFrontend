import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactForm from './ContactForm';

export default function FAQsPage({ onSignInOpen }) {
  const [showContactForm, setShowContactForm] = useState(false);
  
  const faqs = [
    {
      question: "What is PolyBites?",
      answer: "PolyBites is the premier review platform dedicated to Cal Poly's on-campus dining experience. It allows students, faculty, and staff to share their experiences with campus restaurants and food items."
    },
    {
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button in the top right corner of the page. You'll need to provide your full name, email address, and create a password. After signing up, you'll need to verify your email address."
    },
    {
      question: "Can I post reviews anonymously?",
      answer: "Yes! When writing a review, you can check the 'Post as Anonymous' option to keep your identity private while still sharing your dining experience."
    },
    {
      question: "How do I write a review?",
      answer: "Navigate to any restaurant or food item page, and you'll see a 'Write a Review' button. Click it to open the review form where you can rate the item (1-5 stars) and write your thoughts."
    },
    {
      question: "What should I include in my review?",
      answer: "Good reviews include details about taste, portion size, value for money, service quality, and any unique aspects of the dish. Be honest and constructive in your feedback."
    },
    {
      question: "Can I edit or delete my reviews?",
      answer: "Currently, reviews cannot be edited after submission. If you need to remove a review, simply click the red trash can button next to your posted comment and confirm your deletion."
    },
    {
      question: "How are restaurant ratings calculated?",
      answer: "Restaurant ratings are calculated as the average of all individual food item ratings from that restaurant, weighted by the number of reviews."
    },
    {
      question: "What if I find inappropriate content?",
      answer: "We have automated profanity filters in place, but if you encounter inappropriate content, please report it to our support team immediately."
    },
    {
      question: "Is PolyBites only for Cal Poly students?",
      answer: "While PolyBites is primarily designed for the Cal Poly community, anyone can browse reviews. However, posting reviews requires a verified account."
    },
    {
      question: "How often are new restaurants added?",
      answer: "We regularly update our database to include new campus dining locations. If you notice a missing restaurant, please let us know!"
    }
  ];

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
            Frequently Asked Questions
          </h1>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-green-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-4">
              If you couldn't find the answer you're looking for, we're here to help!
            </p>
            <button
              onClick={() => setShowContactForm(true)}
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Contact Support
            </button>
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
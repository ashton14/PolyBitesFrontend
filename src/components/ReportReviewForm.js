import React, { useState } from 'react';
import { getApiUrl } from '../config';

export default function ReportReviewForm({ 
  isOpen, 
  onClose, 
  reviewId, 
  reviewType, 
  onSuccess 
}) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reportReasons = [
    'Inappropriate content',
    'Spam or fake review',
    'Off-topic content',
    'Harassment or bullying',
    'False information',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a reason for reporting this review.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const endpoint = reviewType === 'food' 
        ? 'api/food-reviews/report' 
        : 'api/general-reviews/report';
      
      const response = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [reviewType === 'food' ? 'food_review_id' : 'general_review_id']: reviewId,
          reason: reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to report review');
      }

      onSuccess?.();
      setSuccess(true);
      setReason('');
      setError('');
      // Don't close automatically - let user close manually
    } catch (err) {
      console.error('Error reporting review:', err);
      setError(err.message || 'Failed to report review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleContainerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={handleContainerClick}
      onMouseDown={handleContainerClick}
      onMouseUp={handleContainerClick}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Report Review
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Why are you reporting this review?
            </label>
            <div className="space-y-2">
              {reportReasons.map((reportReason) => (
                <label key={reportReason} className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value={reportReason}
                    checked={reason === reportReason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{reportReason}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm bg-green-50 p-2 rounded">
              Review reported successfully! Thank you for helping keep our community safe.
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Reporting...' : 'Report Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
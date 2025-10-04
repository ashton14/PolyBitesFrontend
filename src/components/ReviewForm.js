import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Filter } from 'bad-words';
import fullStar from '../assets/stars/star.png';
import halfStar from '../assets/stars/half_star.png';
import emptyStar from '../assets/stars/empty_star.png';

export default function ReviewForm({ foodItem, onSubmit, onCancel }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const filter = new Filter();

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleStarHover = (value) => {
    setHoverRating(value);
  };

  const handleStarLeave = () => {
    setHoverRating(null);
  };

  // Render stars with half-star support
  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating !== null ? hoverRating : rating;
    for (let i = 1; i <= 5; i++) {
      if (displayRating >= i) {
        // Full star
        stars.push(
          <img
            key={i + '-full'}
            src={fullStar}
            alt="Full star"
            className="w-8 h-8 inline cursor-pointer"
            onMouseMove={e => {
              const { left, width } = e.target.getBoundingClientRect();
              const x = e.clientX - left;
              if (x < width / 2) {
                handleStarHover(i - 0.5);
              } else {
                handleStarHover(i);
              }
            }}
            onClick={e => {
              const { left, width } = e.target.getBoundingClientRect();
              const x = e.clientX - left;
              if (x < width / 2) {
                handleStarClick(i - 0.5);
              } else {
                handleStarClick(i);
              }
            }}
          />
        );
      } else if (displayRating >= i - 0.5) {
        // Half star
        stars.push(
          <img
            key={i + '-half'}
            src={halfStar}
            alt="Half star"
            className="w-8 h-8 inline cursor-pointer"
            onMouseMove={e => {
              const { left, width } = e.target.getBoundingClientRect();
              const x = e.clientX - left;
              if (x < width / 2) {
                handleStarHover(i - 0.5);
              } else {
                handleStarHover(i);
              }
            }}
            onClick={e => {
              const { left, width } = e.target.getBoundingClientRect();
              const x = e.clientX - left;
              if (x < width / 2) {
                handleStarClick(i - 0.5);
              } else {
                handleStarClick(i);
              }
            }}
          />
        );
      } else {
        // Empty star (use emptyStar icon)
        stars.push(
          <img
            key={i + '-empty'}
            src={emptyStar}
            alt="Empty star"
            className="w-8 h-8 inline cursor-pointer"
            onMouseMove={e => {
              const { left, width } = e.target.getBoundingClientRect();
              const x = e.clientX - left;
              if (x < width / 2) {
                handleStarHover(i - 0.5);
              } else {
                handleStarHover(i);
              }
            }}
            onClick={e => {
              const { left, width } = e.target.getBoundingClientRect();
              const x = e.clientX - left;
              if (x < width / 2) {
                handleStarClick(i - 0.5);
              } else {
                handleStarClick(i);
              }
            }}
          />
        );
      }
    }
    return stars;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for profanity in review text
    if (filter.isProfane(reviewText)) {
      alert('Your review contains inappropriate language. Please revise your review and try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        user_id: user.id,
        food_id: foodItem.id,
        rating,
        text: reviewText,
        anonymous
      });
      
      // Reset form only on successful submission
      setRating(5);
      setReviewText('');
      setAnonymous(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      // Don't reset form on error, let user try again
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Write a Review</h3>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Rating
          </label>
          <div className="flex gap-2" onMouseLeave={handleStarLeave}>
            {renderStars()}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {rating === 0.5 && "AWFUL"}
            {rating === 1 && "POOR"}
            {rating === 1.5 && "UNSATISFACTORY"}
            {rating === 2 && "BELOW AVERAGE"}
            {rating === 2.5 && "OKAY"}
            {rating === 3 && "ABOVE AVERAGE"}
            {rating === 3.5 && "DECENT"}
            {rating === 4 && "GOOD"}
            {rating === 4.5 && "VERY GOOD"}
            {rating === 5 && "EXCELLENT"}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Your Review
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="4"
            placeholder="Share your thoughts about this dish..."
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={e => setAnonymous(e.target.checked)}
              className="form-checkbox h-5 w-5 text-green-600"
              disabled={isSubmitting}
            />
            <span className="ml-2 text-gray-700">Post as Anonymous</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg transition-colors ${
              isSubmitting 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting review..." : "Submit Review"}
          </button>
        </div>
      </form>
    </>
  );
} 
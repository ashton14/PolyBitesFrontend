import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Filter } from 'bad-words';
import fullStar from '../assets/stars/star.png';
import halfStar from '../assets/stars/half_star.png';
import emptyStar from '../assets/stars/empty_star.png';

export default function GeneralReviewForm({ restaurantId, onSubmit, onCancel }) {
  const { user } = useAuth();
  const filter = new Filter();
  const [formData, setFormData] = useState({
    rating: 5,
    text: '',
    anonymous: false
  });
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for profanity
    if (filter.isProfane(formData.text)) {
      alert('Your review contains inappropriate language. Please revise it.');
      return;
    }

    onSubmit({
      restaurant_id: restaurantId,
      user_id: user.id,
      rating: formData.rating,
      text: formData.text,
      anonymous: formData.anonymous
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleStarClick = (starIndex, isHalf) => {
    const newRating = isHalf ? starIndex - 0.5 : starIndex;
    setFormData({
      ...formData,
      rating: newRating
    });
  };

  const handleStarHover = (starIndex, isHalf) => {
    const newRating = isHalf ? starIndex - 0.5 : starIndex;
    setHoverRating(newRating);
  };

  const renderStarRating = () => {
    const stars = [];
    const displayRating = hoverRating || formData.rating;
    
    for (let i = 1; i <= 5; i++) {
      const isFull = i <= displayRating;
      const isHalf = i - 0.5 === displayRating;
      
      let starImage = emptyStar;
      if (isFull) starImage = fullStar;
      else if (isHalf) starImage = halfStar;
      
      stars.push(
        <div key={i} className="relative inline-block">
          <button
            type="button"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const isLeftHalf = x < rect.width / 2;
              handleStarClick(i, isLeftHalf);
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const isLeftHalf = x < rect.width / 2;
              handleStarHover(i, isLeftHalf);
            }}
            onMouseLeave={() => setHoverRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <img
              src={starImage}
              alt={`${i} star`}
              className="w-8 h-8 inline-block"
            />
          </button>
        </div>
      );
    }
    return stars;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 bg-green-50 p-4 sm:p-6 rounded-lg">
      <h4 className="text-lg sm:text-xl font-semibold text-gray-800">Write a Restaurant Review</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
          Rating
        </label>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {renderStarRating()}
          </div>
          <span className="text-sm sm:text-base text-gray-600 font-medium ml-2">
            {formData.rating} / 5
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          id="text"
          name="text"
          value={formData.text}
          onChange={handleChange}
          rows="4"
          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Share your experience with this restaurant..."
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="anonymous"
          name="anonymous"
          checked={formData.anonymous}
          onChange={handleChange}
          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />
        <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
          Post anonymously
        </label>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          type="submit"
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm sm:text-base"
        >
          Submit Review
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium text-sm sm:text-base"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}


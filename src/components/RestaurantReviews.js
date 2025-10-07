import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import GeneralReviewForm from './GeneralReviewForm';
import SignInPopup from './SignInPopup';
import SignUpPopup from './SignUpPopup';
import fullStar from '../assets/stars/star.png';
import halfStar from '../assets/stars/half_star.png';
import emptyStar from '../assets/stars/empty_star.png';
import { getApiUrl } from '../config';

const ANONYMOUS_NAMES = [
  "Anonymous Diner",
  "Faceless Foodie",
  "Redacted Rater",
  "Masked Muncher",
  "Nameless Nibbler",
  "Mystery Michelin",
  "Agent Appétit"
];

// Global cache for user names
const userNameCache = new Map();

function getRandomAnonymousName(seed) {
  if (typeof seed === 'number') {
    return ANONYMOUS_NAMES[seed % ANONYMOUS_NAMES.length];
  }
  return ANONYMOUS_NAMES[0];
}

export default function RestaurantReviews({ restaurantId, onReviewsUpdate }) {
  const { user } = useAuth();
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [reviewStats, setReviewStats] = useState({ review_count: 0, average_rating: 0 });
  
  // Like system state
  const [likeCounts, setLikeCounts] = useState(new Map());
  const [userLikes, setUserLikes] = useState(new Set());
  const [likeLoading, setLikeLoading] = useState(new Set());
  const [sortBy, setSortBy] = useState('likes');

  const handleWriteReviewClick = () => {
    if (user) {
      setIsWritingReview(true);
    } else {
      setShowSignUp(true);
    }
  };

  function formatName(fullName) {
    if (!fullName) return '';
    const [firstName, lastName] = fullName.trim().split(' ');
    return lastName ? `${firstName} ${lastName[0]}.` : firstName;
  }

  // Fetch user names
  const fetchUserName = useCallback(async (userId) => {
    if (userNameCache.has(userId)) {
      setUserNames(prev => ({
        ...prev,
        [userId]: userNameCache.get(userId)
      }));
      return;
    }

    try {
      const response = await fetch(getApiUrl(`api/profiles/auth/${userId}`));
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const userData = await response.json();
      const userName = userData.name;
      
      userNameCache.set(userId, userName);
      setUserNames(prev => ({
        ...prev,
        [userId]: userName
      }));
    } catch (err) {
      console.error('Error fetching profile:', err);
      const fallbackName = 'User #' + userId;
      userNameCache.set(userId, fallbackName);
      setUserNames(prev => ({
        ...prev,
        [userId]: fallbackName
      }));
    }
  }, []);

  const fetchUserNamesBatch = useCallback(async (reviewsData) => {
    const uniqueUserIds = [...new Set(reviewsData.map(review => review.user_id))];
    const uncachedUserIds = uniqueUserIds.filter(userId => !userNameCache.has(userId));
    
    if (user && user.id && user.name && !userNameCache.has(user.id)) {
      userNameCache.set(user.id, user.name);
      setUserNames(prev => ({
        ...prev,
        [user.id]: user.name
      }));
    }
    
    const promises = uncachedUserIds.map(userId => fetchUserName(userId));
    await Promise.all(promises);
  }, [fetchUserName, user]);

  // Helper function to fetch like counts for reviews
  const fetchLikeCounts = useCallback(async (reviewsData) => {
    if (reviewsData.length === 0) return;

    const likeCountsPromises = reviewsData.map(async (review) => {
      try {
        const likeResponse = await fetch(getApiUrl(`api/general-reviews/${review.id}/likes`));
        if (likeResponse.ok) {
          const likeData = await likeResponse.json();
          return { reviewId: review.id, count: likeData.likes || 0 };
        }
        return { reviewId: review.id, count: 0 };
      } catch (err) {
        console.error('Error fetching like count:', err);
        return { reviewId: review.id, count: 0 };
      }
    });

    const likeCountsResults = await Promise.all(likeCountsPromises);
    const likeCountsMap = new Map();
    likeCountsResults.forEach(({ reviewId, count }) => {
      likeCountsMap.set(reviewId, count);
    });
    setLikeCounts(likeCountsMap);

    if (user) {
      const userLikesPromises = reviewsData.map(async (review) => {
        try {
          const likeResponse = await fetch(getApiUrl(`api/general-reviews/${review.id}/like/${user.id}`));
          if (likeResponse.ok) {
            const { exists } = await likeResponse.json();
            return { reviewId: review.id, liked: exists };
          }
          return { reviewId: review.id, liked: false };
        } catch (err) {
          console.error('Error fetching user like status:', err);
          return { reviewId: review.id, liked: false };
        }
      });

      const userLikesResults = await Promise.all(userLikesPromises);
      const userLikesSet = new Set();
      userLikesResults.forEach(({ reviewId, liked }) => {
        if (liked) {
          userLikesSet.add(reviewId);
        }
      });
      setUserLikes(userLikesSet);
    }
  }, [user]);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!restaurantId) return;
      
      try {
        setLikeCounts(new Map());
        setUserLikes(new Set());
        setLikeLoading(new Set());
        
        const [reviewsResponse, statsResponse] = await Promise.all([
          fetch(getApiUrl(`api/general-reviews/restaurant/${restaurantId}`)),
          fetch(getApiUrl(`api/general-reviews/restaurant/${restaurantId}/stats`))
        ]);

        if (!reviewsResponse.ok) {
          throw new Error('Failed to fetch reviews');
        }
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }

        const [reviewsData, statsData] = await Promise.all([
          reviewsResponse.json(),
          statsResponse.json()
        ]);

        setReviews(reviewsData);
        setReviewStats(statsData);
        
        await fetchUserNamesBatch(reviewsData);
        await fetchLikeCounts(reviewsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [restaurantId, user, fetchUserNamesBatch, fetchLikeCounts]);

  const handleSubmitReview = async (reviewData) => {
    try {
      const response = await fetch(getApiUrl('api/general-reviews'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Refresh reviews
      const [updatedReviewsResponse, updatedStatsResponse] = await Promise.all([
        fetch(getApiUrl(`api/general-reviews/restaurant/${restaurantId}`)),
        fetch(getApiUrl(`api/general-reviews/restaurant/${restaurantId}/stats`))
      ]);

      if (updatedReviewsResponse.ok && updatedStatsResponse.ok) {
        const [updatedReviews, updatedStats] = await Promise.all([
          updatedReviewsResponse.json(),
          updatedStatsResponse.json()
        ]);
        
        setReviews(updatedReviews);
        setReviewStats(updatedStats);
        
        await fetchUserNamesBatch(updatedReviews);
        await fetchLikeCounts(updatedReviews);
        
        const newUserId = reviewData.user_id;
        if (!userNames[newUserId]) {
          fetchUserName(newUserId);
        }
      }

      if (onReviewsUpdate) {
        await onReviewsUpdate();
      }

      setIsWritingReview(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`api/general-reviews/${reviewId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
        credentials: 'include'
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to delete review');
      }

      // Refresh reviews
      const [updatedReviewsResponse, updatedStatsResponse] = await Promise.all([
        fetch(getApiUrl(`api/general-reviews/restaurant/${restaurantId}`)),
        fetch(getApiUrl(`api/general-reviews/restaurant/${restaurantId}/stats`))
      ]);

      if (updatedReviewsResponse.ok && updatedStatsResponse.ok) {
        const [updatedReviews, updatedStats] = await Promise.all([
          updatedReviewsResponse.json(),
          updatedStatsResponse.json()
        ]);
        
        setReviews(updatedReviews);
        setReviewStats(updatedStats);
        
        await fetchUserNamesBatch(updatedReviews);
        await fetchLikeCounts(updatedReviews);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(error.message || 'Failed to delete review. Please try again.');
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) {
      setShowSignIn(true);
      return;
    }

    if (likeLoading.has(reviewId)) {
      return;
    }

    try {
      setLikeLoading(prev => new Set(prev).add(reviewId));

      const response = await fetch(getApiUrl(`api/general-reviews/${reviewId}/toggle-like`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          review_id: reviewId, 
          user_id: user.id 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      
      setLikeCounts(prev => new Map(prev).set(reviewId, data.likes));
      
      setUserLikes(prev => {
        const newSet = new Set(prev);
        if (data.liked) {
          newSet.add(reviewId);
        } else {
          newSet.delete(reviewId);
        }
        return newSet;
      });

    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like. Please try again.');
    } finally {
      setLikeLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    let remaining = Math.round(rating * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (remaining >= 1) {
        stars.push(<img key={i + '-full'} src={fullStar} alt="Full star" className="w-5 h-5 inline" />);
        remaining -= 1;
      } else if (remaining === 0.5) {
        stars.push(<img key={i + '-half'} src={halfStar} alt="Half star" className="w-5 h-5 inline" />);
        remaining -= 0.5;
      } else {
        stars.push(<img key={i + '-empty'} src={emptyStar} alt="Empty star" className="w-5 h-5 inline" />);
      }
    }
    return stars;
  };

  const getSortedReviews = () => {
    if (!reviews.length) return [];
    
    const sortedReviews = [...reviews];
    
    if (sortBy === 'likes') {
      sortedReviews.sort((a, b) => {
        const likesA = likeCounts.get(a.id) || 0;
        const likesB = likeCounts.get(b.id) || 0;
        return likesB - likesA;
      });
    } else if (sortBy === 'recent') {
      sortedReviews.sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
        
        // If dates are the same, sort by ID (higher ID = newer)
        if (dateB === dateA) {
          return b.id - a.id;
        }
        
        return dateB - dateA;
      });
    }
    
    return sortedReviews;
  };

  const getRatingColor = (rating) => {
    const clamped = Math.max(0, Math.min(5, rating));
    const hue = (clamped / 5) * 120;
    return `hsl(${hue}, 70%, 40%)`;
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">Restaurant Reviews</h3>
        {!isWritingReview && (
          <button
            onClick={handleWriteReviewClick}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>

      <SignInPopup 
        isOpen={showSignIn} 
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
      />
      
      <SignUpPopup
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
      />

      {isWritingReview ? (
        <GeneralReviewForm
          restaurantId={restaurantId}
          onSubmit={handleSubmitReview}
          onCancel={() => setIsWritingReview(false)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-lg"
                  style={{ color: getRatingColor(reviewStats.average_rating) }}
                >
                  {reviewStats.average_rating ? Number(reviewStats.average_rating).toFixed(1) : '0.0'}
                </span>
                <span className="flex items-center">{renderStars(reviewStats.average_rating)}</span>
                <span className="text-gray-500 text-sm">({reviewStats.review_count || 0} reviews)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-gray-600">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="likes">Most Liked</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading reviews...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-4">Error loading reviews: {error}</div>
          ) : reviews.length > 0 ? (
            <div className="space-y-3">
              {getSortedReviews().map((review) => (
                <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">
                        {review.anonymous
                          ? getRandomAnonymousName(review.id)
                          : (formatName(userNames[review.user_id]) || 'User')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric'
                        }) : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-green-600 flex items-center">{renderStars(review.rating)}</span>
                      {user && user.id === review.user_id && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete review"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.text}</p>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleLikeReview(review.id)}
                      disabled={likeLoading.has(review.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        likeLoading.has(review.id) 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                      title={userLikes.has(review.id) ? "Unlike review" : "Like review"}
                    >
                      {likeLoading.has(review.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      ) : (
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill={userLikes.has(review.id) ? "currentColor" : "none"}
                          stroke="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      )}
                      <span className="text-sm">{likeCounts.get(review.id) || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review this restaurant!</p>
          )}
        </>
      )}
    </div>
  );
}


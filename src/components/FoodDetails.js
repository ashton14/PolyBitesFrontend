import React, { useState, useEffect, useCallback } from 'react';
import ReviewForm from './ReviewForm';
import { useAuth } from '../context/AuthContext';
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

// Global cache for user names to avoid repeated API calls
const userNameCache = new Map();

function getRandomAnonymousName(seed) {
  // Use a deterministic seed (e.g., review id) so the name doesn't change on rerender
  if (typeof seed === 'number') {
    return ANONYMOUS_NAMES[seed % ANONYMOUS_NAMES.length];
  }
  // fallback
  return ANONYMOUS_NAMES[0];
}

export default function FoodDetails({ isOpen, onClose, foodItem, onRestaurantUpdate }) {
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userNames, setUserNames] = useState({});
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { user } = useAuth();
  const [reviewStats, setReviewStats] = useState({ review_count: 0, average_rating: 0 });
  
  // Like system state
  const [likeCounts, setLikeCounts] = useState(new Map()); // Track like counts for each review
  const [userLikes, setUserLikes] = useState(new Set()); // Track which reviews the user has liked
  const [likeLoading, setLikeLoading] = useState(new Set()); // Track which reviews are being processed
  const [sortBy, setSortBy] = useState('likes'); // Sort by likes (default) or recent

  const [currentFoodId, setCurrentFoodId] = useState(null);

  // Function to get gradient color based on value
  const getValueColor = (value) => {
    if (value >= 130) {
      return { backgroundColor: '#06b6d4' }; // Cyan for high values
    } else if (value <= 30) {
      return { backgroundColor: '#0f172a' }; // Very very dark blue for low values
    } else {
      // Solid color from very dark blue to cyan for values between 30-130
      const ratio = (value - 30) / 100; // 100 is the range from 30 to 130
      const red = Math.floor(15 - (ratio * 9));
      const green = Math.floor(23 + (ratio * 159));
      const blue = Math.floor(42 + (ratio * 170));
      return { backgroundColor: `rgb(${red}, ${green}, ${blue})` };
    }
  };

  const handleCloseSignIn = () => {
    setShowSignIn(false);
  };

  const handleCloseSignUp = () => {
    setShowSignUp(false);
  };

  const handleSwitchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

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

  // Optimized user name fetching with caching
  const fetchUserName = useCallback(async (userId) => {
    // Check cache first
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
      console.log('Fetched name for', userId, ':', userName); // DEBUG
      
      // Cache the result
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

  // Batch fetch user names for all reviews
  const fetchUserNamesBatch = useCallback(async (reviewsData) => {
    console.log('Current user:', user);
    console.log('Review user IDs:', reviewsData.map(r => r.user_id));
    const uniqueUserIds = [...new Set(reviewsData.map(review => review.user_id))];
    const uncachedUserIds = uniqueUserIds.filter(userId => !userNameCache.has(userId));
    // Add current user to cache if not present
    if (user && user.id && user.name && !userNameCache.has(user.id)) {
      userNameCache.set(user.id, user.name);
      setUserNames(prev => ({
        ...prev,
        [user.id]: user.name
      }));
      console.log('Set current user name in cache:', user.id, user.name);
    }
    console.log('Fetching user names for:', uncachedUserIds); // DEBUG
    const promises = uncachedUserIds.map(userId => fetchUserName(userId));
    await Promise.all(promises);
  }, [fetchUserName, user]);

  useEffect(() => {
    if (isOpen && foodItem?.id) {
      setLoading(true);
      setReviews([]);
      setError(null);
      setCurrentFoodId(foodItem.id); // Track the current food being loaded
    }
    const fetchReviews = async () => {
      if (!foodItem?.id) return;
      
      try {
        // Reset like tracking when opening
        setLikeCounts(new Map());
        setUserLikes(new Set());
        setLikeLoading(new Set());
        
        const [reviewsResponse, statsResponse] = await Promise.all([
          fetch(getApiUrl(`api/food-reviews/food/${foodItem.id}`)),
          fetch(getApiUrl(`api/food-reviews/food/${foodItem.id}/stats`))
        ]);

        if (!reviewsResponse.ok) {
          const errorText = await reviewsResponse.text();
          console.error('Reviews response error:', reviewsResponse.status, errorText);
          throw new Error(errorText || 'Failed to fetch reviews');
        }
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch stats');
        }

        const [reviewsData, statsData] = await Promise.all([
          reviewsResponse.json(),
          statsResponse.json()
        ]);

        setReviews(reviewsData);
        setReviewStats(statsData);
        
        // Fetch user names in batch
        await fetchUserNamesBatch(reviewsData);
        
        // Only fetch like data if there are reviews
        if (reviewsData.length > 0) {
          // Batch fetch like counts for all reviews
          const likeCountsPromises = reviewsData.map(async (review) => {
            try {
              const likeResponse = await fetch(getApiUrl(`api/food-reviews/${review.id}/likes`));
              if (likeResponse.ok) {
                const likeData = await likeResponse.json();
                return { reviewId: review.id, count: likeData.likes || 0 };
              }
              return { reviewId: review.id, count: 0 };
            } catch (err) {
              console.error('Error fetching like count for review:', review.id, err);
              return { reviewId: review.id, count: 0 };
            }
          });

          const likeCountsResults = await Promise.all(likeCountsPromises);
          const likeCountsMap = new Map();
          likeCountsResults.forEach(({ reviewId, count }) => {
            likeCountsMap.set(reviewId, count);
          });
          setLikeCounts(likeCountsMap);

          // If user is logged in, batch fetch their like status for all reviews
          if (user) {
            const userLikesPromises = reviewsData.map(async (review) => {
              try {
                const likeResponse = await fetch(getApiUrl(`api/food-reviews/${review.id}/like/${user.id}`));
                if (likeResponse.ok) {
                  const { exists } = await likeResponse.json();
                  return { reviewId: review.id, liked: exists };
                }
                return { reviewId: review.id, liked: false };
              } catch (err) {
                console.error('Error fetching user like status for review:', review.id, err);
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
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, foodItem?.id, user, fetchUserNamesBatch]);

  useEffect(() => {
    if (isOpen) {
      userNameCache.clear();
      setUserNames({});
    }
  }, [isOpen, foodItem]);

  useEffect(() => {
    async function fetchOwnProfileName() {
      if (user && user.id && !userNames[user.id]) {
        try {
          const response = await fetch(getApiUrl(`api/profiles/auth/${user.id}`));
          if (response.ok) {
            const profile = await response.json();
            console.log('Fetched profile for current user:', profile); // DEBUG
            if (profile.name) {
              userNameCache.set(user.id, profile.name);
              setUserNames(prev => {
                const updated = { ...prev, [user.id]: profile.name };
                console.log('Updated userNames after setting own name:', updated); // DEBUG
                return updated;
              });
              console.log('Fetched and set own profile name:', user.id, profile.name);
            } else {
              console.log('Profile has no name property or is empty:', profile);
            }
          } else {
            console.log('Failed to fetch profile for current user');
          }
        } catch (err) {
          console.error('Error fetching own profile name:', err);
        }
      }
    }
    fetchOwnProfileName();
  }, [user, userNames]);

  useEffect(() => {
    if (reviews.length > 0) {
      fetchUserNamesBatch(reviews);
    }
  }, [reviews, fetchUserNamesBatch]);

  if (!isOpen || !foodItem) return null;

  // Show loading if loading, or if the loaded food is not the current food
  if (loading || foodItem.id !== currentFoodId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmitReview = async (reviewData) => {
    try {
      const response = await fetch(getApiUrl('api/food-reviews'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      // Fetch updated reviews and stats
      const [updatedReviewsResponse, updatedStatsResponse] = await Promise.all([
        fetch(getApiUrl(`api/food-reviews/food/${foodItem.id}`)),
        fetch(getApiUrl(`api/food-reviews/food/${foodItem.id}/stats`))
      ]);

      if (updatedReviewsResponse.ok && updatedStatsResponse.ok) {
        const [updatedReviews, updatedStats] = await Promise.all([
          updatedReviewsResponse.json(),
          updatedStatsResponse.json()
        ]);
        
        setReviews(updatedReviews);
        setReviewStats(updatedStats);
        
        // Fetch user name for the new review if needed
        const newUserId = reviewData.user_id;
        if (!userNames[newUserId]) {
          fetchUserName(newUserId);
        }
      }

      // Update restaurant ratings on homepage and refresh food ratings
      if (onRestaurantUpdate) {
        await onRestaurantUpdate();
      }

      setIsWritingReview(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

    // Helper to get food icon path (same as RestaurantDetails)
  const getFoodIcon = (food_type) => {
    try {
      if (food_type) {
        return require(`../assets/icons/${food_type.toLowerCase()}.png`);
      }
    } catch (e) {}
    return require('../assets/icons/food_default.png');
  };

  // Render stars with half-star support for review ratings
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

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`api/food-reviews/${reviewId}`), {
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

      // Fetch updated reviews and stats
      const [updatedReviewsResponse, updatedStatsResponse] = await Promise.all([
        fetch(getApiUrl(`api/food-reviews/food/${foodItem.id}`)),
        fetch(getApiUrl(`api/food-reviews/food/${foodItem.id}/stats`))
      ]);

      if (updatedReviewsResponse.ok && updatedStatsResponse.ok) {
        const [updatedReviews, updatedStats] = await Promise.all([
          updatedReviewsResponse.json(),
          updatedStatsResponse.json()
        ]);
        
        setReviews(updatedReviews);
        setReviewStats(updatedStats);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(error.message || 'Failed to delete review. Please try again.');
    }
  };

  // Throttle function to prevent spam clicking
  const throttle = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) return; // If already throttled, ignore
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, delay);
    };
  };

  const handleLikeReview = async (reviewId) => {
    if (!user) {
      setShowSignIn(true);
      return;
    }

    // Prevent multiple clicks while processing
    if (likeLoading.has(reviewId)) {
      return;
    }

    try {
      // Set loading state
      setLikeLoading(prev => new Set(prev).add(reviewId));

      // Call the toggle like API
      const response = await fetch(getApiUrl(`api/food-reviews/${reviewId}/toggle-like`), {
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
      
      // Update like count
      setLikeCounts(prev => new Map(prev).set(reviewId, data.likes));
      
      // Update user like status
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
      // Remove loading state
      setLikeLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  // Throttled version of handleLikeReview
  const throttledHandleLikeReview = throttle(handleLikeReview, 500); // 500ms throttle

  // Sort reviews based on selected option
  const getSortedReviews = () => {
    if (!reviews.length) return [];
    
    const sortedReviews = [...reviews];
    
    if (sortBy === 'likes') {
      // Sort by number of likes (descending)
      sortedReviews.sort((a, b) => {
        const likesA = likeCounts.get(a.id) || 0;
        const likesB = likeCounts.get(b.id) || 0;
        return likesB - likesA;
      });
    } else if (sortBy === 'recent') {
      // Sort by creation date (most recent first)
      sortedReviews.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });
    }
    
    return sortedReviews;
  };

  // Returns a color from red (0) to green (5) for the rating
  const getRatingColor = (rating) => {
    // Clamp rating between 0 and 5
    const clamped = Math.max(0, Math.min(5, rating));
    // Interpolate hue from 0 (red) to 120 (green)
    const hue = (clamped / 5) * 120;
    return `hsl(${hue}, 70%, 40%)`;
  };

  const handleClose = async () => {
    // Reset like tracking
    setLikeCounts(new Map());
    setUserLikes(new Set());
    setLikeLoading(new Set());
    
    // Call the original onClose
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="food-review-popup bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex flex-col items-center justify-center">
          <div className="flex flex-row justify-center items-center gap-4 my-4">
            <img
              src={getFoodIcon(foodItem.food_type)}
              alt={foodItem.name}
              className="w-24 h-24 object-contain"
            />
            <img
              src={getFoodIcon(foodItem.food_type)}
              alt={foodItem.name}
              className="w-24 h-24 object-contain"
            />
            <img
              src={getFoodIcon(foodItem.food_type)}
              alt={foodItem.name}
              className="w-24 h-24 object-contain"
            />
          </div>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-800 text-xl">×</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800">{foodItem.name}</h3>
              <p className="text-green-600 text-lg font-medium">${foodItem.price}</p>
            </div>
            {!isWritingReview && (
              <button
                onClick={handleWriteReviewClick}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Add SignIn/SignUp Popups */}
          <SignInPopup 
            isOpen={showSignIn} 
            onClose={handleCloseSignIn}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
          
          <SignUpPopup
            isOpen={showSignUp}
            onClose={handleCloseSignUp}
            onSwitchToSignIn={handleSwitchToSignIn}
          />

          {isWritingReview ? (
            <ReviewForm
              foodItem={foodItem}
              onSubmit={handleSubmitReview}
              onCancel={() => setIsWritingReview(false)}
            />
          ) : (
            <>
              <p className="text-gray-600 mb-4">{foodItem.description}</p>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-800">Reviews</h4>
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
                {/* Average rating display */}
                <div className="flex items-center gap-4 mb-4">
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
                  {typeof foodItem.value === 'number' && foodItem.value > 0 && (
                    <span 
                      className="ml-4 px-2 py-1 text-white rounded text-sm font-medium" 
                      style={getValueColor(Math.trunc(foodItem.value * 100))}
                      title="Value = Average Rating / Price * 100"
                    >
                      Value: {Math.trunc(foodItem.value * 100)}
                    </span>
                  )}
                </div>
                {loading ? (
                  <div className="text-center py-4">Loading reviews...</div>
                ) : error ? (
                  <div className="text-center text-red-600 py-4">Error loading reviews: {error}</div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-3">
                    {getSortedReviews().map((review) => {
                      return (
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
                              onClick={() => throttledHandleLikeReview(review.id)}
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
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 

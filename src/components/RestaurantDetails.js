import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import FoodReview from './FoodDetails';
import RestaurantReviews from './RestaurantReviews';
import ContactForm from './ContactForm';
import fullStar from '../assets/stars/star.png';
import halfStar from '../assets/stars/half_star.png';
import emptyStar from '../assets/stars/empty_star.png';
import valueSortIcon from '../assets/icons/value_sort.png';
import valueIcon from '../assets/icons/value.png';
import { getApiUrl } from '../config';

export default function RestaurantDetails({ restaurants, onRestaurantUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFood, setSelectedFood] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [foodRatings, setFoodRatings] = useState({});
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem('polybites-menu-sort-by') || 'none';
  });
  const pageRef = useRef(null);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  
  // Food search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [displayedSearchTerm, setDisplayedSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  
  const restaurant = restaurants?.find(r => r.id === parseInt(id));
  const averageRating = restaurant?.average_rating || 0;

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

  // Function to get gradient text color based on value
  const getValueTextColor = (value) => {
    if (value >= 130) {
      return { color: '#06b6d4' }; // Solid cyan for high values
    } else if (value <= 30) {
      return { color: '#0f172a' }; // Solid very dark blue for low values
    } else {
      // Solid color from very dark blue to cyan for values between 30-130
      const ratio = (value - 30) / 100; // 100 is the range from 30 to 130
      const red = Math.floor(15 - (ratio * 9));
      const green = Math.floor(23 + (ratio * 159));
      const blue = Math.floor(42 + (ratio * 170));
      return { color: `rgb(${red}, ${green}, ${blue})` };
    }
  };

  // Save sort preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('polybites-menu-sort-by', sortBy);
  }, [sortBy]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 150); // 150ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search food items when debounced search term changes
  useEffect(() => {
    const searchFoodItems = async () => {
      if (debouncedSearchTerm.trim() === '') {
        setFilteredMenuItems(menuItems);
        setHasSearched(false);
        setDisplayedSearchTerm('');
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(getApiUrl(`api/foods/restaurant/${id}/search?q=${encodeURIComponent(debouncedSearchTerm)}`));
        if (!response.ok) {
          throw new Error('Failed to search food items');
        }
        const searchResults = await response.json();
        setFilteredMenuItems(searchResults);
        setHasSearched(true);
        setDisplayedSearchTerm(debouncedSearchTerm);
      } catch (err) {
        console.error('Error searching food items:', err);
        // Fallback to client-side filtering if API fails
        const filtered = menuItems.filter(item =>
          item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
        setFilteredMenuItems(filtered);
        setHasSearched(true);
        setDisplayedSearchTerm(debouncedSearchTerm);
      }
      setSearchLoading(false);
    };

    if (id && menuItems.length > 0) {
      searchFoodItems();
    }
  }, [debouncedSearchTerm, id, menuItems]);

  // Add click-away handler for sort dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (isSortDropdownOpen && !event.target.closest('.sort-dropdown')) {
        setIsSortDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  // Optimized sorting function for menu items
  const sortMenuItems = useCallback((items, ratings, sortType) => {
    if (!items.length) return items;
    
    const sorted = [...items];
    
    switch (sortType) {
      case 'rating_desc':
        sorted.sort((a, b) => {
          const aRating = parseFloat(ratings[a.id]?.average_rating) || 0;
          const bRating = parseFloat(ratings[b.id]?.average_rating) || 0;
          return bRating - aRating;
        });
        break;
      case 'rating_asc':
        sorted.sort((a, b) => {
          const aRating = parseFloat(ratings[a.id]?.average_rating) || 0;
          const bRating = parseFloat(ratings[b.id]?.average_rating) || 0;
          return aRating - bRating;
        });
        break;
      case 'value_desc':
        sorted.sort((a, b) => {
          const aValue = parseFloat(a.value) || 0;
          const bValue = parseFloat(b.value) || 0;
          return bValue - aValue;
        });
        break;
      case 'reviews':
        sorted.sort((a, b) => {
          const aReviews = parseInt(ratings[a.id]?.review_count) || 0;
          const bReviews = parseInt(ratings[b.id]?.review_count) || 0;
          return bReviews - aReviews;
        });
        break;
      case 'menu_items':
        sorted.sort((a, b) => {
          const aItems = parseInt(ratings[a.id]?.menu_item_count) || 0;
          const bItems = parseInt(ratings[b.id]?.menu_item_count) || 0;
          return bItems - aItems;
        });
        break;
      case 'alphabetical':
        sorted.sort((a, b) => {
          const aName = (a.name || '').toLowerCase();
          const bName = (b.name || '').toLowerCase();
          return aName.localeCompare(bName);
        });
        break;
      case 'none':
        return items;
      default:
        // Default to rating descending
        sorted.sort((a, b) => {
          const aRating = parseFloat(ratings[a.id]?.average_rating) || 0;
          const bRating = parseFloat(ratings[b.id]?.average_rating) || 0;
          return bRating - aRating;
        });
    }
    
    return sorted;
  }, []);

  // Memoized sorted menu items
  const sortedMenuItems = useMemo(() => {
    return sortMenuItems(filteredMenuItems.length > 0 ? filteredMenuItems : menuItems, foodRatings, sortBy);
  }, [filteredMenuItems, menuItems, foodRatings, sortBy, sortMenuItems]);

  // Function to refresh restaurant data
  const refreshRestaurantData = async () => {
    if (onRestaurantUpdate) {
      await onRestaurantUpdate();
    }
    
    // Also refresh food ratings for this restaurant
    try {
      const ratingsResponse = await fetch(getApiUrl(`api/food-reviews/restaurant/${id}/stats`));
      if (ratingsResponse.ok) {
        const ratingsData = await ratingsResponse.json();
        setFoodRatings(ratingsData);
      }
    } catch (err) {
      console.error('Error refreshing food ratings:', err);
    }
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(getApiUrl(`api/foods/restaurant/${id}`));
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        setMenuItems(data);
        
        // Fetch all food ratings for this restaurant in one call
        const ratingsResponse = await fetch(getApiUrl(`api/food-reviews/restaurant/${id}/stats`));
        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json();
          setFoodRatings(ratingsData);
        } else {
          // Fallback: set default ratings if the batch call fails
          const defaultRatings = {};
          data.forEach(food => {
            defaultRatings[food.id] = { review_count: 0, average_rating: 0 };
          });
          setFoodRatings(defaultRatings);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (id) {
      fetchMenuItems();
    }
  }, [id]);

  useEffect(() => {
    function handleClickOutside(event) {
      // Close the food review if clicking outside of it and it's not a menu item click
      if (selectedFood && 
          !event.target.closest('.food-review-popup') && 
          !event.target.closest('.menu-item')) {
        setSelectedFood(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedFood]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Open food modal if highlight param is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlight = params.get('highlight');
    if (highlight && menuItems.length > 0) {
      const food = menuItems.find(item => String(item.id) === String(highlight));
      if (food) {
        setSelectedFood(food);
      }
    }
  }, [location.search, menuItems]);

  // Render stars with half-star support for average rating
  const renderStars = (rating) => {
    const stars = [];
    let remaining = Math.round(rating * 2) / 2; // round to nearest 0.5
    for (let i = 1; i <= 5; i++) {
      if (remaining >= 1) {
        stars.push(<img key={i + '-full'} src={fullStar} alt="Full star" className="w-6 h-6 inline" />);
        remaining -= 1;
      } else if (remaining === 0.5) {
        stars.push(<img key={i + '-half'} src={halfStar} alt="Half star" className="w-6 h-6 inline" />);
        remaining -= 0.5;
      } else {
        stars.push(<img key={i + '-empty'} src={emptyStar} alt="Empty star" className="w-6 h-6 inline" />);
      }
    }
    return stars;
  };

  // Returns a color from red (0) to green (5) for the rating
  const getRatingColor = (rating) => {
    // Clamp rating between 0 and 5
    const clamped = Math.max(0, Math.min(5, rating));
    // Interpolate hue from 0 (red) to 120 (green)
    const hue = (clamped / 5) * 120;
    return `hsl(${hue}, 70%, 40%)`;
  };

  // Helper to get food icon path
  const getFoodIcon = (food_type) => {
    try {
      if (food_type) {
        return require(`../assets/icons/${food_type.toLowerCase()}.png`);
      }
    } catch (e) {}
    return require('../assets/icons/food_default.png');
  };

  const handleSort = (value) => {
    setSortBy(value);
  };


  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Restaurant not found</h2>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="relative min-h-screen">
      {/* Fixed back button */}
      <div className="fixed top-20 left-2 sm:left-4 md:left-8 z-[60]">
        <button
          onClick={() => navigate('/')}
          className="px-3 py-2 sm:px-6 sm:py-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2 shadow-lg text-sm sm:text-base"
        >
          <span>←</span> 
          <span className="hidden sm:inline">Back to list</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-48 sm:h-60 md:h-72 object-cover"
          />
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                  {restaurant.name}
                </h2>
                {restaurant.Location && (
                  <span className="text-gray-500 text-lg sm:text-xl md:text-3xl" style={{ whiteSpace: 'nowrap' }}>
                    {restaurant.Location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-10 text-base sm:text-lg font-medium">
              <span className="flex items-center gap-2">
                <span style={{ color: getRatingColor(averageRating), fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}>
                  {Number(averageRating).toFixed(1)}
                </span>
                <span className="flex items-center" style={{ fontSize: '1.8rem', height: '2rem' }}>{renderStars(averageRating)}</span>
              </span>
              {typeof restaurant.average_value === 'number' && restaurant.average_value > 0 && (
                <div className="flex items-center gap-2">
                  <span 
                    className="flex items-center gap-1 sm:gap-2 text-2xl sm:text-3xl md:text-4xl font-bold" 
                  >
                    <span className="text-gray text-sm sm:text-base md:text-lg">Avg Value</span>
                    <img src={valueIcon} alt="value" className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9" />
                    <span style={getValueTextColor(Math.trunc(restaurant.average_value * 100))}>
                      {Math.trunc(restaurant.average_value * 100)}
                    </span>
                  </span>
                  <div className="relative group">
                    <svg 
                      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-gray-600 cursor-help" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-3/4 mb-3 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 w-64 sm:w-auto sm:max-w-sm border border-gray-700">
                      <div className="text-center sm:text-left">
                        <div className="font-semibold text-white mb-2">Value Calculation</div>
                        <div className="space-y-1">
                          <div className="font-mono text-green-300 text-xs">Rating ÷ Price × 100</div>
                          <div className="text-xs text-gray-300">Higher value = better deal</div>
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* General Restaurant Reviews Section */}
            <RestaurantReviews 
              restaurantId={id}
              onReviewsUpdate={onRestaurantUpdate}
            />

            {loading ? (
              <div className="text-center py-8">Loading menu items...</div>
            ) : error ? (
              <div className="text-center text-red-600 py-8">Error: {error}</div>
            ) : menuItems.length > 0 ? (
              <div className="mt-6 sm:mt-8">
                <div className="flex flex-col space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {hasSearched && displayedSearchTerm.trim() ? `Results for "${displayedSearchTerm}"` : 'Menu Items'}
                    </h3>
                    <button
                      onClick={() => setIsContactFormOpen(true)}
                      className="text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors font-medium border border-green-300 hover:border-green-400"
                    >
                      Something missing?
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search menu items..."
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                          aria-label="Clear search"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      {searchLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-600"></div>
                        </div>
                      )}
                    </div>
                    <div className="relative sort-dropdown w-full sm:w-auto">
                      <div className="flex items-center gap-2 mb-2 sm:mb-0">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-1 whitespace-nowrap">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M7 8h9m-9 4h6m-6 4h3" />
                          </svg>
                          Sort
                        </label>
                        <div className="relative flex-1">
                          <button
                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                            className={`flex items-center gap-2 sm:gap-3 px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 w-full sm:w-auto text-left ${
                              sortBy === 'none' 
                                ? 'bg-gray-50' 
                                : 'bg-white border-green-200'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              {sortBy === 'none' && (
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                              )}
                              {sortBy === 'rating_desc' && (
                                <>
                                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  <span className="text-gray-900 text-sm">Highest Rated</span>
                                </>
                              )}
                              {sortBy === 'rating_asc' && (
                                <>
                                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  <span className="text-gray-900 text-sm">Lowest Rated</span>
                                </>
                              )}
                              {sortBy === 'reviews' && (
                                <>
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-gray-900 text-sm">Most Reviews</span>
                                </>
                              )}
                             
                              {sortBy === 'alphabetical' && (
                                <>
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                  <span className="text-gray-900 text-sm">A-Z</span>
                                </>
                              )}
                              {sortBy === 'value_desc' && (
                                <>
                                  <img src={valueSortIcon} alt="value sort" className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-900 text-sm">Best Value</span>
                                </>
                              )}
                            </span>
                            {/* Custom dropdown arrow */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${isSortDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                          {sortBy !== 'none' && (
                            <button
                              onClick={() => setSortBy('none')}
                              className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                              aria-label="Clear sort"
                              title="Clear sort"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                          {/* Dropdown menu */}
                          {isSortDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 sm:min-w-[200px]">
                              <div className="py-1">
                                <button
                                  onClick={() => { handleSort('rating_desc'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  <span className="text-gray-900 text-sm">Highest Rated</span>
                                </button>
                                <button
                                  onClick={() => { handleSort('rating_asc'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  <span className="text-gray-900 text-sm">Lowest Rated</span>
                                </button>
                                <button
                                  onClick={() => { handleSort('reviews'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-gray-900 text-sm">Most Reviews</span>
                                </button>
                               
                                <button
                                  onClick={() => { handleSort('alphabetical'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                  <span className="text-gray-900 text-sm">A-Z</span>
                                </button>
                                <button
                                  onClick={() => { handleSort('value_desc'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <img src={valueSortIcon} alt="value sort" className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-900 text-sm">Best Value</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedMenuItems.map((item) => {
                    const foodRating = foodRatings[item.id] || { review_count: 0, average_rating: 0 };
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedFood(item)}
                        className="menu-item group cursor-pointer bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-green-50 transition-colors"
                      >
                        <div className="relative h-40 sm:h-48 mb-3 overflow-hidden rounded">
                          <img
                            src={getFoodIcon(item.food_type)}
                            alt={item.name}
                            className="w-4/5 h-4/5 object-contain mx-auto my-auto group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 sm:p-3">
                            <p className="text-white text-base sm:text-lg font-medium">${item.price}</p>
                          </div>
                          {/* Food Rating Badge - Gradient background based on rating */}
                          <div 
                            className="absolute top-0 right-0 m-2 sm:m-4 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1"
                            style={{ 
                              background: `linear-gradient(135deg, ${getRatingColor(foodRating.average_rating)}, ${getRatingColor(Math.max(0, foodRating.average_rating - 1))})`,
                              backdropFilter: 'blur(4px)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                          >
                            {Number(foodRating.average_rating).toFixed(1)}
                            <img src={fullStar} alt="star" className="w-3 h-3 sm:w-4 sm:h-4 inline" />
                          </div>
                          {/* Food Value Badge - Dark blue to cyan gradient */}
                          {typeof item.value === 'number' && item.value > 0 && (
                            <div 
                              className="absolute bottom-0 right-0 m-2 sm:m-4 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1"
                              style={getValueColor(Math.trunc(item.value * 100))}
                            >
                              <img src={valueIcon} alt="value" className="w-3 h-3 sm:w-4 sm:h-4" />
                              {Math.trunc(item.value * 100)}
                            </div>
                          )}
                        </div>
                        <h4 className="text-base sm:text-lg font-medium text-gray-800 mb-2 line-clamp-2">
                          {item.name}
                        </h4>
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-3">
                          {item.description}
                        </p>
                        {/* Review count display */}
                        <div className="text-gray-500 text-xs sm:text-sm">
                          <strong>{foodRating.review_count}</strong> reviews
                        </div>
                      </div>
                    );
                  })}
                  {sortedMenuItems.length === 0 && hasSearched && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No menu items found matching "{displayedSearchTerm}"
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No menu items available</p>
            )}
          </div>
        </div>

        <FoodReview
          isOpen={!!selectedFood}
          onClose={() => setSelectedFood(null)}
          foodItem={selectedFood}
          onRestaurantUpdate={refreshRestaurantData}
        />
        
        <ContactForm
          isOpen={isContactFormOpen}
          onClose={() => setIsContactFormOpen(false)}
          onSignInOpen={() => {}} // Not needed for this use case
          initialSubject={`MISSING MENU ITEM - ${restaurant?.name || 'Restaurant'}`}
        />
      </div>
      <footer className="text-center text-xs text-gray-400 py-4 bg-green-50 mt-6 sm:mt-8 px-4">
        <a href="https://www.flaticon.com/" title="default food icons" target="_blank" rel="noopener noreferrer">
          Default icons created by Freepik - Flaticon
        </a>
      </footer>
    </div>
  );
} 
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Restaurant from "./components/Restaurant";
import RestaurantDetails from "./components/RestaurantDetails";

// Login
import SignInPopup from "./components/SignInPopup";
import SignUpPopup from "./components/SignUpPopup";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import "./styles/App.css"
import AboutPage from './components/AboutPage';
import ProfilePage from './components/ProfilePage';
import FAQsPage from './components/FAQsPage';
import TermsPage from './components/TermsPage';
import ResetPassword from './components/ResetPassword';
import valueSortIcon from './assets/icons/value_sort.png';


function Layout({ children, isSignInOpen, setIsSignInOpen }) {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const handleSwitchToSignUp = () => {
    setIsSignInOpen(false);
    setIsSignUpOpen(true);
  };

  const handleSwitchToSignIn = () => {
    setIsSignUpOpen(false);
    setIsSignInOpen(true);
  };

    return (
    <div className="min-h-screen bg-green-50">
      {/* Use Navbar */}
      <Navbar onSignInOpen={() => setIsSignInOpen(true)} 
              onSignUpOpen={() => setIsSignUpOpen(true)}/>

      {/* Popups */}
      <SignInPopup
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSwitchToSignUp={handleSwitchToSignUp}
      />

      <SignUpPopup
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToSignIn={handleSwitchToSignIn}
      />

      {/* Children */}
      {children}
    </div>
  );
}

function HomePage({ restaurants, loading, error }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState(restaurants);
  const [hasSearched, setHasSearched] = useState(false);
  const [displayedSearchTerm, setDisplayedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(() => {
    // Initialize from localStorage or default to 'none'
    return localStorage.getItem('polybites-sort-by') || 'none';
  });
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Animation state for subtitle lines
  const [subtitleVisible, setSubtitleVisible] = useState([false, false, false]);

  // Save sort preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('polybites-sort-by', sortBy);
  }, [sortBy]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 150); // 150ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Optimized sorting function with better performance
  const sortRestaurants = useCallback((restaurants, sortType) => {
    if (!restaurants.length) return restaurants;
    
    const sorted = [...restaurants];
    
    switch (sortType) {
      case 'rating_desc':
        sorted.sort((a, b) => {
          const aRating = parseFloat(a.average_rating) || 0;
          const bRating = parseFloat(b.average_rating) || 0;
          return bRating - aRating;
        });
        break;
      case 'rating_asc':
        sorted.sort((a, b) => {
          const aRating = parseFloat(a.average_rating) || 0;
          const bRating = parseFloat(b.average_rating) || 0;
          return aRating - bRating;
        });
        break;
      case 'value_desc':
        sorted.sort((a, b) => {
          const aValue = parseFloat(a.average_value) || 0;
          const bValue = parseFloat(b.average_value) || 0;
          return bValue - aValue;
        });
        break;
      case 'reviews':
        sorted.sort((a, b) => {
          const aReviews = parseInt(a.review_count) || 0;
          const bReviews = parseInt(b.review_count) || 0;
          return bReviews - aReviews;
        });
        break;
      case 'menu_items':
        sorted.sort((a, b) => {
          const aItems = parseInt(a.menu_item_count) || 0;
          const bItems = parseInt(b.menu_item_count) || 0;
          return bItems - aItems;
        });
        break;
      case 'location':
        sorted.sort((a, b) => {
          const aLocation = (a.Location || '').toLowerCase();
          const bLocation = (b.Location || '').toLowerCase();
          return aLocation.localeCompare(bLocation);
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
        // Return original order - no sorting
        return sorted;
      default:
        // Default to rating sorting
        sorted.sort((a, b) => {
          const aRating = parseFloat(a.average_rating) || 0;
          const bRating = parseFloat(b.average_rating) || 0;
          return bRating - aRating;
        });
    }
    
    return sorted;
  }, []);

  // Optimized memoization with better dependencies
  const processedRestaurants = useMemo(() => {
    if (!restaurants.length) return [];
    
    // First filter
    const filtered = debouncedSearchTerm.trim() === ''
      ? restaurants
      : restaurants.filter(restaurant =>
          restaurant.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    
    // Then sort
    return sortRestaurants(filtered, sortBy);
  }, [debouncedSearchTerm, sortBy, restaurants, sortRestaurants]);

  // Optimized effect to reduce re-renders
  useEffect(() => {
    setFilteredRestaurants(processedRestaurants);
    if (debouncedSearchTerm.trim() !== '') {
      setHasSearched(true);
      setDisplayedSearchTerm(debouncedSearchTerm);
    } else {
      setHasSearched(false);
      setDisplayedSearchTerm('');
    }
  }, [processedRestaurants, debouncedSearchTerm]);

  // Optimized animation effect
  useEffect(() => {
    const timers = [
      setTimeout(() => setSubtitleVisible([true, false, false]), 800),
      setTimeout(() => setSubtitleVisible([true, true, false]), 1600),
      setTimeout(() => setSubtitleVisible([true, true, true]), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Close dropdown when clicking outside
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

  const handleSearch = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    if (newSearchTerm.trim() === '') {
      setHasSearched(false);
      setDisplayedSearchTerm('');
    }
  };

  const handleSort = (value) => {
    setSortBy(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDisplayedSearchTerm('');
    setHasSearched(false);
    setDebouncedSearchTerm('');
  };

  const clearSort = () => {
    setSortBy('none');
  };

  return (
    <main>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-green-600 to-green-500 text-white pt-4 pb-16 sm:pt-5 sm:pb-24 mb-16 sm:mb-20 relative overflow-hidden" style={{ height: '50vh', minHeight: 300 }}>
        {/* Opaque food image background */}
        <img
          src={require('./assets/images/food-back.jpg')}
          alt="Food background"
          className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none select-none"
          style={{ zIndex: 0, minHeight: 300 }}
          loading="lazy"
          decoding="async"
        />
        {/* Overlay for better blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-700/80 to-green-500/80" style={{ zIndex: 1, paddingTop: 0}}></div>
        <div className="container mx-auto px-4 text-center relative z-10 flex flex-col justify-center items-center h-full" >
          <h1 className="text-4xl sm:text-6xl md:text-8xl text-black font-extrabold mb-4 sm:mb-8 animate-fade-in" style={{marginTop: 90}}>
            PolyBites
          </h1>
          <p className="text-lg sm:text-2xl md:text-4xl text-green-100 mb-6 sm:mb-12 font-semibold px-2">
            <span className={`block transition-all duration-700 ${subtitleVisible[0] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>Your Ratings.</span>
            <span className={`block transition-all duration-700 ${subtitleVisible[1] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>Your Reviews.</span>
            <span className={`block transition-all duration-700 ${subtitleVisible[2] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>Your Restaurants.</span>
          </p>
          <div className="w-16 sm:w-24 h-1 bg-white mx-auto rounded-full opacity-50"></div>
        </div>
        {/* Wave SVG divider */}
        {/* <div
          className="absolute left-0 right-0 bottom-0 w-full overflow-hidden leading-none pointer-events-none z-10"
          style={{ lineHeight: 0, bottom: '-1px' }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1440 320"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-80"
            style={{ display: 'block', width: '120%', height: '100%', transform: 'scale(-1, -1)' }}
          >
            <path
              d="M0,32L48,32C96,32,192,32,288,58.7C384,85,480,139,576,149.3C672,160,768,128,864,122.7C960,117,1056,139,1152,154.7C1248,171,1344,181,1392,186.7L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
              stroke="none"
              strokeWidth="0"
              fill="#f0fdf4"
              fillOpacity="1"
            />
          </svg>
        </div> */}
      </div>

      {/* Restaurants Section */}
      <div className="container mx-auto px-4 -mt-32 sm:-mt-44 pt-24 sm:pt-32 pb-4 rounded-t-lg z-20" style={{position: 'relative'}}>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Loading restaurants...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 bg-red-50 p-4 rounded-lg inline-block">
              Error: {error}
            </div>
          </div>
        ) : (
          <>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
              <div className="flex flex-col space-y-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center sm:text-left">
                  {hasSearched && displayedSearchTerm.trim() ? `Results for "${displayedSearchTerm}"` : 'All Restaurants'}
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearch}
                      placeholder="Search restaurants..."
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                        aria-label="Clear search"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  <div className="relative w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1 whitespace-nowrap">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M7 8h9m-9 4h6m-6 4h3" />
                        </svg>
                        Sort
                      </label>
                      <div className="relative sort-dropdown flex-1 sm:mr-6">
                        <div className="relative">
                          <button
                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                            className={`flex items-center gap-2 px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm transition-all duration-200 w-full sm:w-auto text-left ${
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
                                  <span className="text-gray-900">Lowest Rated</span>
                                </>
                              )}
                              {sortBy === 'reviews' && (
                                <>
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-gray-900">Most Reviews</span>
                                </>
                              )}
                              {sortBy === 'menu_items' && (
                                <>
                                  <img src={require('./assets/images/dish.png')} alt="Food" className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-gray-900">Most Menu Items</span>
                                </>
                              )}
                              {sortBy === 'location' && (
                                <>
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="text-gray-900">Location</span>
                                </>
                              )}
                              {sortBy === 'alphabetical' && (
                                <>
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                  <span className="text-gray-900">A-Z</span>
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
                          
                          {/* Dropdown menu */}
                          {isSortDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 sm:min-w-[200px]">
                              <div className="py-1">
                                <button
                                  onClick={() => { handleSort('rating_desc'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <svg className="w-[1.05rem] h-[1.05rem] text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  <span className="text-gray-900">Highest Rated</span>
                                </button>
                                <button
                                  onClick={() => { handleSort('rating_asc'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  <span className="text-gray-900">Lowest Rated</span>
                                </button>
                                <button
                                  onClick={() => { handleSort('reviews'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-gray-900">Most Reviews</span>
                                </button>
                                <button
                                  onClick={() => { handleSort('menu_items'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <img src={require('./assets/images/dish.png')} alt="Food" className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-gray-900">Most Menu Items</span>
                                </button>
                                <button
                                  onClick={() => { handleSort('location'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="text-gray-900">Location</span>
                                </button>
                                <button
                                  onClick={() => { handleSort('alphabetical'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                  <span className="text-gray-900">A-Z</span>
                                </button>
                                <button
                                  onClick={() => { handleSort('value_desc'); setIsSortDropdownOpen(false); }}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                                >
                                  <img src={valueSortIcon} alt="value sort" className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                  <span className="text-gray-900">Best Value</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Clear sort button */}
                        {sortBy !== 'none' && (
                          <button
                            onClick={clearSort}
                            className="absolute -right-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                            aria-label="Clear sort"
                            title="Clear sort"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 pb-8 sm:pb-12 justify-items-center">
                {filteredRestaurants.map((restaurant) => (
                  <Restaurant
                    key={restaurant.id}
                    data={restaurant}
                  />
                ))}
                {filteredRestaurants.length === 0 && hasSearched && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No restaurants found matching "{displayedSearchTerm}"
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('https://polybitesbackend-production.up.railway.app/api/restaurants');
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      const data = await response.json();
      setRestaurants(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const handleSignInOpen = () => {
    setIsSignInOpen(true);
  };

  return (
      <AuthProvider>
        <BrowserRouter>
          <Layout isSignInOpen={isSignInOpen} setIsSignInOpen={setIsSignInOpen}>
            <Routes>
              <Route
                path="/"
                element={<HomePage 
                  restaurants={restaurants || []} 
                  loading={loading} 
                  error={error} 
                />}
              />
              <Route
                path="/restaurant/:id"
                element={<RestaurantDetails restaurants={restaurants || []} onRestaurantUpdate={fetchRestaurants} />}
              />
              <Route
                path="/about"
                element={<AboutPage onSignInOpen={handleSignInOpen} />}
              />
              <Route
                path="/profile"
                element={<ProfilePage />}
              />
              <Route
                path="/faqs"
                element={<FAQsPage onSignInOpen={handleSignInOpen} />}
              />
              <Route
                path="/terms"
                element={<TermsPage onSignInOpen={handleSignInOpen} />}
              />
              <Route
                path="/reset-password"
                element={<ResetPassword />}
              />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
  );
}

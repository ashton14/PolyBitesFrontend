import React from "react";
import { Link } from "react-router-dom";
import '../styles/Restaurant.css';
import fullStar from '../assets/stars/star.png';
import valueIcon from '../assets/icons/value.png';

const Restaurant = React.memo(({ data, loading = false, statsLoading = false }) => {
  // Use the data that's already available from the main API call
  const averageRating = data?.average_rating || 0;
  const reviewCount = data?.review_count || 0;
  const menuItemCount = data?.menu_item_count || 0;
  const formattedRating = Number(averageRating).toFixed(1);
  const formattedValue = typeof data?.average_value === 'number' && data.average_value > 0 ? Math.trunc(data.average_value * 100) : null;
  
  // Check if stats are still loading (no rating data available yet)
  const isStatsLoading = statsLoading && (!data?.average_rating && !data?.review_count && !data?.average_value);

  // Skeleton loading component
  if (loading || !data) {
    return (
      <div className="block bg-white shadow-lg rounded-xl overflow-hidden w-[350px] h-[400px] border border-gray-100 animate-pulse">
        <div className="relative h-[200px] bg-gray-200"></div>
        <div className="p-5 h-[200px] flex flex-col">
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-1 w-full"></div>
          <div className="h-4 bg-gray-200 rounded mb-1 w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="mt-auto flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

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

  // Return early with loading state if data is not yet available
  if (!data) {
    return null;
  }

  // Return early if no ID is available
  if (!data.id) {
    return null;
  }

  return (
    <Link
      to={`/restaurant/${data.id}`}
      className="group block bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 w-[350px] h-[400px] border border-gray-100 hover:border-green-200"
    >
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={data.image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={data.name || 'Restaurant'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Rating badge with enhanced styling */}
        <div className="absolute top-0 right-0 m-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg backdrop-blur-sm">
          {isStatsLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              {formattedRating}
              <img src={fullStar} alt="star" className="w-4 h-4 inline" />
            </>
          )}
        </div>
        {/* Value badge with enhanced styling */}
        {formattedValue !== null && (
          <div 
            className="absolute bottom-0 right-0 m-4 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg backdrop-blur-sm" 
            style={getValueColor(formattedValue)}
            title="Average Value = Avg(Food Value) * 100"
          >
            <img src={valueIcon} alt="value" className="w-4 h-4 inline" />
            {formattedValue}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>
      <div className="p-5 h-[200px] flex flex-col bg-gradient-to-b from-white to-gray-50">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold heading-font text-gray-800 mb-2 group-hover:text-green-700 transition-colors duration-200">
            {data.name || 'Unnamed Restaurant'}
          </h2> 
        </div>
        {data.Location && (
          <p className="text-gray-500 text-sm mb-2 font-medium">{data.Location}</p>
        )}
        {data.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3 leading-relaxed">
            {data.description}
          </p>
        )}

        <div className="mt-auto space-y-1">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <strong className="text-gray-800">{menuItemCount}</strong> items
            </span>
            <span className="text-gray-600 flex items-center gap-1">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <strong className="text-gray-800">{reviewCount}</strong> reviews
            </span>
          </div>
        </div>
      </div>
    </Link>
    
  );
});

Restaurant.displayName = 'Restaurant';

export default Restaurant;


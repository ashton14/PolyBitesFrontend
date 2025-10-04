import React from "react";
import { Link } from "react-router-dom";
import '../styles/Restaurant.css';
import fullStar from '../assets/stars/star.png';
import valueIcon from '../assets/icons/value.png';

const Restaurant = React.memo(({ data }) => {
  // Use the data that's already available from the main API call
  const averageRating = data?.average_rating || 0;
  const reviewCount = data?.review_count || 0;
  const menuItemCount = data?.menu_item_count || 0;
  const formattedRating = Number(averageRating).toFixed(1);
  const formattedValue = typeof data.average_value === 'number' && data.average_value > 0 ? Math.trunc(data.average_value * 100) : null;

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
      className="block bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-[350px] h-[400px]"
    >
      <div className="relative h-[200px]">
        <img
          src={data.image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={data.name || 'Restaurant'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-0 right-0 m-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          {formattedRating}
          <img src={fullStar} alt="star" className="w-4 h-4 inline" />
        </div>
        {formattedValue !== null && (
          <div 
            className="absolute bottom-0 right-0 m-4 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-md" 
            style={getValueColor(formattedValue)}
            title="Average Value = Avg(Food Value) * 100"
          >
            <img src={valueIcon} alt="value" className="w-4 h-4 inline" />
            {formattedValue}
          </div>
        )}
      </div>
      <div className="p-5 h-[200px] flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{data.name || 'Unnamed Restaurant'}</h2> 
        </div>
        {data.Location && (
          <p className="text-gray-400 text-sm mb-2">{data.Location}</p>
        )}
        {data.description && (
          <p className="text-gray-500 text-sm mb-2 line-clamp-3">
            {data.description}
          </p>
        )}

        <div className="mt-auto space-y-1">
          <p className="text-gray-500 text-sm"><strong>{menuItemCount}</strong> menu items</p>
          <p className="text-gray-500 text-sm"><strong>{reviewCount}</strong> reviews</p>
        </div>
      </div>
    </Link>
    
  );
});

Restaurant.displayName = 'Restaurant';

export default Restaurant;


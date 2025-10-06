import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Filter } from 'bad-words';
import fullStar from '../assets/stars/star.png';
import halfStar from '../assets/stars/half_star.png';
import emptyStar from '../assets/stars/empty_star.png';
import { getApiUrl } from '../config';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const filter = new Filter();

  const getFoodIcon = (food_type) => {
    try {
      if (food_type) {
        return require(`../assets/icons/${food_type.toLowerCase()}.png`);
      }
    } catch (e) {}
    return require('../assets/icons/food_default.png');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<img key={i} src={fullStar} alt="star" className="w-4 h-4" />);
    }
    if (hasHalfStar) {
      stars.push(<img key="half" src={halfStar} alt="half star" className="w-4 h-4" />);
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<img key={`empty-${i}`} src={emptyStar} alt="empty star" className="w-4 h-4" />);
    }

    return stars;
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(getApiUrl(`api/profiles/auth/${user.id}`));
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const profileData = await response.json();
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          email: user.email || ''
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  useEffect(() => {
    if (profile && user) {
      fetchUserReviews();
    }
  }, [profile, user]);

  const fetchUserReviews = async () => {
    if (!user) return;
    
    setReviewsLoading(true);
    try {
      const response = await fetch(getApiUrl(`api/food-reviews/user/${user.id}`));
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const reviewsData = await response.json();
      setUserReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      setError('Failed to load your reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (profile?.name_change === 1) {
      if (!window.confirm('Are you sure? You can only change your name once.')) {
        return;
      }
    }
    // Check for profanity in name
    if (filter.isProfane(formData.name)) {
      setError('Name contains inappropriate language. Please choose a different name.');
      return;
    }

    try {
      const requestBody = {
        name: formData.name
      };

      const response = await fetch(getApiUrl(`api/profiles/auth/${user.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false); // Exit edit mode after successful update
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          setError('You have already changed your name once. Further changes are not allowed.');
          setProfile({ ...profile, name_change: 0 });
          setIsEditing(false);
        } else {
          setError(errorData.error || 'Failed to update profile');
        }
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An error occurred while updating your profile');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== profile?.name) {
      setError('Please type your full name exactly as shown to confirm deletion.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      console.log('Attempting to delete account for user:', user.id);
      const response = await fetch(getApiUrl(`api/profiles/auth/${user.id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: user.id }),
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        logout && logout();
        navigate('/');
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Delete error response:', errorData);
        setError(errorData.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('An error occurred while deleting your account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && error !== 'You have already changed your name once. Further changes are not allowed.') {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Link to="/" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Debug: log profile
  console.log('Profile object:', profile);

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-green-600 to-green-500 text-white py-16 relative">
        <div className="absolute top-6 left-6 z-10">
          <Link 
            to="/" 
            className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Profile</h1>
          <p className="text-xl opacity-90">Manage your account settings</p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {isEditing ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                console.log('Submitting form');
                setError("");
                if (profile?.name_change === 0) {
                  // Do nothing if not allowed
                  return;
                }
                // Normalize whitespace for comparison
                const normalize = (str) => str.trim().replace(/\s+/g, ' ');
                if (normalize(formData.name) === normalize(profile?.name)) {
                  setIsEditing(false);
                  return;
                }
                // Always show confirmation for debugging
                const confirmed = window.confirm('Are you sure? You can only change your username once. This action is permanent.');
                if (!confirmed) {
                  return;
                }
                // Check for profanity in name
                if (filter.isProfane(formData.name)) {
                  setError('Name contains inappropriate language. Please choose a different name.');
                  return;
                }
                try {
                  const requestBody = { name: formData.name };
                  const response = await fetch(getApiUrl(`api/profiles/auth/${user.id}`), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody),
                  });
                  if (response.ok) {
                    const updatedProfile = await response.json();
                    setProfile(updatedProfile);
                    setIsEditing(false);
                  } else {
                    const errorData = await response.json();
                    if (response.status === 403) {
                      // Do not set global error, just update profile and show warning
                      setProfile({ ...profile, name_change: 0 });
                      setIsEditing(false);
                    } else {
                      setError(errorData.error || 'Failed to update profile');
                    }
                  }
                } catch (err) {
                  console.error('Error updating profile:', err);
                  setError('An error occurred while updating your profile');
                }
              }} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    disabled={profile?.name_change === 0}
                  />
                  {/* Always show warning for debugging */}
                  <p className="text-xs text-yellow-600 mt-1 font-semibold">
                    Warning: You can only change your username once. This action is permanent.
                  </p>
                  {profile?.name_change === 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      You have already changed your name once. Further changes are not allowed.
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    disabled={profile?.name_change === 0}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>

                {/* Delete Account Section */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Danger Zone</h4>
                  <p className="text-gray-600 mb-4">
                    Once you delete your account, there is no going back. All reviews created will be removed. Please be certain.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium text-base"
                  >
                    Delete Account
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Full Name</span>
                    <span className="text-gray-900 font-semibold text-lg">{profile?.name || 'Not set'}</span>
                  </div>

                  {/* Email */}
                  <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Email</span>
                    <span className="text-gray-900 text-lg">{user?.email}</span>
                  </div>

                  {/* User ID */}
                  <div className="flex justify-between items-center py-4 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">User ID</span>
                    <span className="text-gray-900 text-lg">{user?.id}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-base"
                    disabled={profile?.name_change === 0}
                  >
                    Edit Profile
                  </button>
                </div>

                {profile?.name_change === 1 && (
                  <p className="text-xs text-yellow-600 mt-1">
                    You can only change your name once. Click "Edit Profile" to change it.
                  </p>
                )}
                {profile?.name_change === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    You have already changed your name once. Further changes are not allowed.
                  </p>
                )}

                {/* User Reviews Section */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">My Reviews</h3>
                  
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading your reviews...</p>
                    </div>
                  ) : userReviews.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">You haven't written any reviews yet.</p>
                      <Link 
                        to="/" 
                        className="inline-block mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Write Your First Review
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userReviews.map((review) => {
                        console.log('Review object:', review);
                        console.log('getFoodIcon argument:', review.food_type);
                        return (
                          <div 
                            key={review.id} 
                            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                            onClick={() => navigate(`/restaurant/${review.restaurant_id}?highlight=${review.food_id}`)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={getFoodIcon(review.food_type)} 
                                  alt={review.food_name} 
                                  className="w-8 h-8 object-cover rounded"
                                />
                                <div>
                                  <h4 className="font-semibold text-gray-800">{review.food_name}</h4>
                                  <p className="text-sm text-gray-600">{review.restaurant_name}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{review.text}</p>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center space-x-4">
                                <span className="text-xs text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <span>❤</span>
                                  <span>{review.like_count || 0}</span>
                                </div>
                              </div>
                              {review.anonymous && (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                  Anonymous
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Delete Account</h3>
              <p className="text-gray-600">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type your full name to confirm: <span className="font-semibold">{profile?.name}</span>
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== profile?.name}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isDeleting || deleteConfirmation !== profile?.name
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                  setError('');
                }}
                disabled={isDeleting}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaCity, FaBuilding, FaMedal, FaClipboardList } from 'react-icons/fa';
import { getUserIssues } from '../../services/issueService';
import defaultProfilePic from '../../assets/default-profile.svg';

const Profile = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    city: '',
    department: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [userIssues, setUserIssues] = useState([]);
  const [heroPoints, setHeroPoints] = useState(0);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        city: user.city || '',
        department: user.department || ''
      });
    }
  }, [user]);
  
  // Fetch user issues and calculate hero points
  useEffect(() => {
    const fetchUserIssues = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoadingIssues(true);
          // Fetch all user issues (set a higher limit to get all)
          const response = await getUserIssues(1, 100); 
          
          // Check if response has the expected structure
          const issues = response.issues || response;
          
          // Store the issues
          setUserIssues(Array.isArray(issues) ? issues : []);
          
          // Calculate hero points (10 points per issue)
          const points = Array.isArray(issues) ? issues.length * 10 : 0;
          setHeroPoints(points);
        } catch (error) {
          console.error('Error fetching user issues:', error);
          toast.error('Failed to load user issues');
        } finally {
          setIsLoadingIssues(false);
        }
      }
    };
    
    fetchUserIssues();
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Prepare form data
      const updatedUserData = new FormData();
      updatedUserData.append('name', formData.name);
      updatedUserData.append('phoneNumber', formData.phoneNumber);
      
      if (profileImage) {
        updatedUserData.append('profileImage', profileImage);
      }
      
      // Update user profile
      const result = await updateProfile(updatedUserData);
      
      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated, return null (PrivateRoute will handle redirect)
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
        </div>
        
        <div className="p-6">
          {/* Profile display/edit form */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile image section */}
              <div className="flex flex-col items-center">
                <div className="mb-4 w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-blue-500">
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={defaultProfilePic}
                      alt={user.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {isEditing && (
                  <div className="mb-4">
                    <label 
                      htmlFor="profileImage" 
                      className="block py-2 px-4 bg-blue-600 text-white rounded cursor-pointer text-center hover:bg-blue-700 transition duration-200"
                    >
                      Change Photo
                    </label>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
                
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              {/* Profile details */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="text-gray-700 text-sm font-medium mb-2 flex items-center">
                      <FaUser className="mr-2" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    ) : (
                      <p className="text-gray-800">{user?.name || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className="text-gray-700 text-sm font-medium mb-2 flex items-center">
                      <FaEnvelope className="mr-2" />
                      Email
                    </label>
                    <p className="text-gray-800">{user?.email || 'Not provided'}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="text-gray-700 text-sm font-medium mb-2 flex items-center">
                      <FaPhone className="mr-2" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-800">{user?.phoneNumber || 'Not provided'}</p>
                    )}
                  </div>
                  
                  {user?.role === 'citizen' && (
                    <div className="mb-4">
                      <label className="text-gray-700 text-sm font-medium mb-2 flex items-center">
                        <FaCity className="mr-2" />
                        City
                      </label>
                      <p className="text-gray-800">
                        {user?.city?.name || 'Not specified'}
                      </p>
                    </div>
                  )}
                  
                  {user?.role === 'department' && (
                    <>
                      <div className="mb-4">
                        <label className="flex items-center text-gray-700 text-sm font-medium mb-2">
                          <FaCity className="mr-2" />
                          City
                        </label>
                        <p className="text-gray-800">
                          {user?.city?.name || 'Not specified'}
                        </p>
                      </div>
                      
                      <div className="mb-4">
                        <label className="text-gray-700 text-sm font-medium mb-2 flex items-center">
                          <FaBuilding className="mr-2" />
                          Department
                        </label>
                        <p className="text-gray-800">
                          {user?.department || 'Not specified'}
                        </p>
                      </div>
                    </>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Role
                    </label>
                    <p className="text-gray-800 capitalize">
                      {user?.role || 'User'}
                    </p>
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
          
          {/* Hero Points Section - Available for all users */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl mt-8 border border-blue-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center text-indigo-700 font-bold text-xl">
                <FaMedal className="mr-3 text-yellow-500 text-2xl" />
                Hero Points Dashboard
              </h3>
              
              {/* Hero Level Badge */}
              <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                Level {Math.floor(heroPoints / 50) + 1}
              </div>
            </div>
            
            {/* Points Display */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <FaClipboardList className="text-blue-600 text-lg" />
                  </div>
                  <span className="text-gray-700 font-medium">Total Reports</span>
                </div>
                <span className="font-bold text-xl text-green-600">{isLoadingIssues ? 'Loading...' : userIssues.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <FaMedal className="text-yellow-600 text-lg" />
                  </div>
                  <span className="text-gray-700 font-medium">Hero Points</span>
                </div>
                <span className="font-bold text-2xl text-indigo-600">{isLoadingIssues ? 'Loading...' : heroPoints}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress to Next Level</span>
                <span>{heroPoints % 50}/50 points</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${(heroPoints % 50) * 2}%` }}
                ></div>
              </div>
            </div>
            
            {/* Motivational Message */}
            <div className="bg-indigo-100 rounded-lg p-3 text-sm text-indigo-800 flex items-start border border-indigo-200">
              <div className="flex-shrink-0 mr-2 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Earn 10 points for each issue you report!</p>
                <p className="mt-1">Reach level 5 to unlock special citizen badges and recognition.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

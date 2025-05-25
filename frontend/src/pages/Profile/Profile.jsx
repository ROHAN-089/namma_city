import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaCity, FaBuilding } from 'react-icons/fa';
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
                        <label className="text-gray-700 text-sm font-medium mb-2 flex items-center">
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
        </div>
      </div>
    </div>
  );
};

export default Profile;

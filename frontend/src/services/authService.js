import api from './api';

// User registration
export const registerUser = async (userData, isMultipart = false) => {
  // Check if userData is FormData (file upload) or regular JSON
  if (isMultipart) {
    const response = await api.post('/users', userData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } else {
    const response = await api.post('/users', userData);
    return response.data;
  }
};

// Department registration
export const registerDepartment = async (departmentData, isMultipart = false) => {
  // Ensure role is set to department
  if (isMultipart) {
    // For FormData
    departmentData.append('role', 'department');
    const response = await api.post('/users', departmentData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } else {
    // For JSON data
    const response = await api.post('/users', {
      ...departmentData,
      role: 'department'
    });
    return response.data;
  }
};

// User login
export const loginUser = async (email, password) => {
  const response = await api.post('/users/login', { email, password });
  
  // Save token and user info to localStorage
  if (response.data.token) {
    localStorage.setItem('userToken', response.data.token);
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  }
  
  return response.data;
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userInfo');
};

// Get user profile
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  
  // Update user info in localStorage
  if (response.data) {
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const updatedUser = { ...currentUser, ...response.data };
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
  }
  
  return response.data;
};

// Update profile image
export const updateProfileImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('profileImage', imageFile);
  
  const response = await api.put('/users/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('userToken');
  return !!token;
};

// Get current user info
export const getCurrentUser = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};

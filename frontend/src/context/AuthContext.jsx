import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, isAuthenticated, getCurrentUser, updateUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to login. Please check your credentials.'
      };
    }
  };

  const register = async (userData) => {
    try {
      const user = await registerUser(userData);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  const registerDepartment = async (departmentData) => {
    try {
      const userData = { ...departmentData, role: 'department' };
      const user = await registerUser(userData);
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Department registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Department registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = await updateUserProfile(userData);
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update profile. Please try again.'
      };
    }
  };

  const value = {
    user,
    login,
    register,
    registerDepartment,
    logout,
    updateProfile,
    loading,
    isAuthenticated: () => !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaCog, FaChevronDown } from 'react-icons/fa';
import defaultProfilePic from '../../assets/default-profile.svg';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-blue-600 shadow-lg w-full">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link to="/" className="flex items-center py-4 space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span className="font-bold text-2xl text-white">City<span className="text-blue-200">Reporter</span></span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              <Link to="/" className="py-4 px-2 text-white hover:text-blue-200">Home</Link>
              {user && (
                <>
                  {user.role === 'citizen' && (
                    <>
                      <Link to="/dashboard" className="py-4 px-2 text-white hover:text-blue-200">Dashboard</Link>
                      <Link to="/report-issue" className="py-4 px-2 text-white hover:text-blue-200">Report Issue</Link>
                    </>
                  )}
                  {user.role === 'department' && (
                    <Link to="/department/dashboard" className="py-4 px-2 text-white hover:text-blue-200">Department Dashboard</Link>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <Link to="/dashboard" className="py-4 px-2 text-white hover:text-blue-200">Dashboard</Link>
                      <Link to="/city-registration" className="py-4 px-2 text-white hover:text-blue-200">Manage Cities</Link>
                      <Link to="/admin/users" className="py-4 px-2 text-white hover:text-blue-200">Manage Users</Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <img src={defaultProfilePic} alt={user.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span>{user.name}</span>
                  <FaChevronDown className={`text-white transition-transform duration-200 ${isProfileOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Profile dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {user.city?.name && (
                        <p className="text-xs text-blue-500 mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {user.city.name}
                        </p>
                      )}
                    </div>
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaUser className="mr-3 text-gray-500" />
                      My Profile
                    </Link>
                    <Link 
                      to="/settings" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaCog className="mr-3 text-gray-500" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FaSignOutAlt className="mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="py-2 px-4 text-white bg-transparent hover:bg-blue-500 rounded transition duration-300">Login</Link>
                <Link to="/register" className="py-2 px-4 bg-blue-800 hover:bg-blue-900 text-white rounded transition duration-300">Register</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="outline-none mobile-menu-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-600">
          {user && (
            <div className="flex items-center px-3 py-2 mb-3 border-b border-blue-500 pb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden mr-3">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <img src={defaultProfilePic} alt={user.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-blue-200 text-xs">{user.email}</p>
                {user.city?.name && (
                  <p className="text-xs text-blue-200 flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {user.city.name}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <Link
            to="/"
            className="block px-3 py-2 rounded text-white hover:bg-blue-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          {user && (
            <>
              {user.role === 'citizen' && (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded text-white hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/report-issue"
                    className="block px-3 py-2 rounded text-white hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Report Issue
                  </Link>
                </>
              )}

              {user.role === 'department' && (
                <Link
                  to="/department/dashboard"
                  className="block px-3 py-2 rounded text-white hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Department Dashboard
                </Link>
              )}

              {user.role === 'admin' && (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded text-white hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/city-registration"
                    className="block px-3 py-2 rounded text-white hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Manage Cities
                  </Link>
                  <Link
                    to="/admin/users"
                    className="block px-3 py-2 rounded text-white hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Manage Users
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        
        {user ? (
          <div className="py-3 px-4 bg-blue-700">
            <div className="border-t border-blue-600 pt-2 pb-1 mb-2">
              <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-2">Account</p>
            </div>
            <Link
              to="/profile"
              className="flex items-center px-3 py-2 rounded text-white hover:bg-blue-800 transition-colors mb-1"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaUser className="mr-3 text-blue-300" />
              My Profile
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-3 py-2 rounded text-white hover:bg-blue-800 transition-colors mb-1"
              onClick={() => setIsMenuOpen(false)}
            >
              <FaCog className="mr-3 text-blue-300" />
              Settings
            </Link>
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded text-white text-left hover:bg-blue-800 transition-colors mt-2"
            >
              <FaSignOutAlt className="mr-3 text-blue-300" />
              Logout
            </button>
          </div>
        ) : (
          <div className="py-3 px-4 bg-blue-700 flex flex-col space-y-3">
            <Link
              to="/login"
              className="block px-4 py-3 rounded-lg text-white text-center hover:bg-blue-800 transition-colors border border-blue-500"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block px-4 py-3 rounded-lg bg-white text-blue-700 font-medium text-center hover:bg-blue-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

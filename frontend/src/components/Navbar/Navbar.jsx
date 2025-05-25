import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
              <div className="relative flex items-center space-x-2 group">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <span className="text-white">{user.name}</span>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Profile dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
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

              <Link
                to="/profile"
                className="block px-3 py-2 rounded text-white hover:bg-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                My Profile
              </Link>

              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded text-white bg-red-500 hover:bg-red-600 mt-2"
              >
                Logout
              </button>
            </>
          )}
          {!user && (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded text-white hover:bg-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded text-white hover:bg-blue-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

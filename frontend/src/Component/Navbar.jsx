import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ currentPage, onNavigate }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="text-2xl font-bold">🚖 WageTexi</div>
          </div>

          {/* Desktop Menu */}
          {isAuthenticated && (
            <div className="hidden md:flex space-x-8">
              {user?.type === 'owner' ? (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === 'dashboard' ? 'bg-blue-900' : 'hover:bg-blue-700'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => onNavigate('profile')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === 'profile' ? 'bg-blue-900' : 'hover:bg-blue-700'
                    }`}
                  >
                    My Vehicles
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('vehicles')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === 'vehicles' ? 'bg-blue-900' : 'hover:bg-blue-700'
                    }`}
                  >
                    Browse Vehicles
                  </button>
                  <button
                    onClick={() => onNavigate('booking')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === 'booking' ? 'bg-blue-900' : 'hover:bg-blue-700'
                    }`}
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={() => onNavigate('profile')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === 'profile' ? 'bg-blue-900' : 'hover:bg-blue-700'
                    }`}
                  >
                    Profile
                  </button>
                </>
              )}
            </div>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-sm">{user?.name}</span>
                <button
                  onClick={() => {
                    logout();
                    onNavigate('home');
                  }}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('login')}
                  className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  Sign Up
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

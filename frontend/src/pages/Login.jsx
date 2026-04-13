import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';

const Login = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('driver');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mock login - replace with actual API call
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        type: userType,
      };

      login(userData);
      if (onNavigate) {
        onNavigate(userType === 'owner' ? 'dashboard' : 'vehicles');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar currentPage="login" onNavigate={handleNavigate} />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Sign in to your WageTexi account</p>
          </div>

          {/* User Type Tabs */}
          <div className="flex gap-4 bg-gray-100 p-2 rounded-lg">
            <button
              onClick={() => setUserType('driver')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition ${
                userType === 'driver'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Driver
            </button>
            <button
              onClick={() => setUserType('owner')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition ${
                userType === 'owner'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Owner
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition ${
                userType === 'driver'
                  ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                  : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => handleNavigate('register')}
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;

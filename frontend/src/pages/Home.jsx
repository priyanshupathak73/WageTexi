import React, { useState } from 'react';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';

const Home = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('driver');

  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar currentPage="home" onNavigate={handleNavigate} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Earn More, Drive Flexible.</h1>
              <p className="text-lg mb-8 text-blue-100">
                Connect with premium vehicle owners and start earning today with flexible daily rental options.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => handleNavigate('register')}
                  className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition"
                >
                  Get Started as Driver
                </button>
                <button
                  onClick={() => handleNavigate('login')}
                  className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition"
                >
                  List Your Vehicle
                </button>
              </div>
            </div>

            {/* Right Side - Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm mt-2">Active Drivers</div>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
                <div className="text-3xl font-bold">$24M</div>
                <div className="text-sm mt-2">Earned by Drivers</div>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
                <div className="text-3xl font-bold">42</div>
                <div className="text-sm mt-2">Cities Covered</div>
              </div>
              <div className="bg-white/10 backdrop-blur p-6 rounded-lg">
                <div className="text-3xl font-bold">99.9%</div>
                <div className="text-sm mt-2">Service Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose WageTexi?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-xl font-bold mb-3">Premium Vehicles</h3>
              <p className="text-gray-600">
                Access a curated selection of well-maintained vehicles from verified owners.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-3">Competitive Rates</h3>
              <p className="text-gray-600">
                Flexible pricing from $30-120 per day. Keep 70% of your earnings!
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3">Easy Booking</h3>
              <p className="text-gray-600">
                Simple and secure booking process with real-time availability tracking.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-3">Secure & Safe</h3>
              <p className="text-gray-600">
                Comprehensive insurance coverage and 24/7 roadside assistance included.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Transparent Analytics</h3>
              <p className="text-gray-600">
                Track earnings, vehicle performance, and analytics in real-time dashboard.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-3">GPS Tracking</h3>
              <p className="text-gray-600">
                Know where your vehicle is at all times with advanced GPS tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* For Drivers */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-blue-600">For Drivers</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-bold mb-1">Sign Up & Verify</h4>
                    <p className="text-gray-600 text-sm">Create an account and complete background verification.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-bold mb-1">Browse Vehicles</h4>
                    <p className="text-gray-600 text-sm">Explore available vehicles in your area with detailed information.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-bold mb-1">Book & Drive</h4>
                    <p className="text-gray-600 text-sm">Complete booking and start earning immediately.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-bold mb-1">Track Earnings</h4>
                    <p className="text-gray-600 text-sm">Monitor your earnings and performance in real-time.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Owners */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-green-600">For Owners</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="font-bold mb-1">List Your Vehicle</h4>
                    <p className="text-gray-600 text-sm">Add your vehicle details and set daily rental rates.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="font-bold mb-1">Approve Drivers</h4>
                    <p className="text-gray-600 text-sm">Review and approve verified drivers for your vehicle.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="font-bold mb-1">Monitor & Earn</h4>
                    <p className="text-gray-600 text-sm">Track bookings and vehicle performance on dashboard.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="font-bold mb-1">Get Paid</h4>
                    <p className="text-gray-600 text-sm">Receive weekly payouts directly to your account.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start?</h2>
          <p className="text-lg mb-8 text-blue-100">Join thousands of drivers and owners already earning with WageTexi.</p>
          <button
            onClick={() => handleNavigate('register')}
            className="bg-white text-blue-600 font-bold py-3 px-12 rounded-lg hover:bg-gray-100 transition text-lg"
          >
            Sign Up Today
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

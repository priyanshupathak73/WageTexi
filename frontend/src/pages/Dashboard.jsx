import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../Component/Navbar';
import Footer from '../Component/Footer';
import VehicleCard from '../Component/VehicleCard';

const Dashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Mock data
  const vehicles = [
    {
      id: 1,
      model: 'Tesla Model 3',
      type: 'Sedan',
      pricePerDay: 120,
      location: 'Downtown',
      rating: 4.8,
      reviews: 245,
      capacity: 5,
      imageUrl: 'https://via.placeholder.com/300x200?text=Tesla+Model+3',
      status: 'Active',
      earnings: 42890,
    },
    {
      id: 2,
      model: 'BMW iX3',
      type: 'SUV',
      pricePerDay: 150,
      location: 'Airport Area',
      rating: 4.7,
      reviews: 189,
      capacity: 5,
      imageUrl: 'https://via.placeholder.com/300x200?text=BMW+IX3',
      status: 'Active',
      earnings: 38500,
    },
    {
      id: 3,
      model: 'Toyota Prius Gen 5',
      type: 'Hybrid',
      pricePerDay: 85,
      location: 'Uptown',
      rating: 4.6,
      reviews: 320,
      capacity: 5,
      imageUrl: 'https://via.placeholder.com/300x200?text=Toyota+Prius',
      status: 'Maintenance',
      earnings: 52100,
    },
  ];

  const stats = [
    { label: 'Total Earnings', value: '$42,890', icon: '💰' },
    { label: 'Active Vehicles', value: '2', icon: '🚗' },
    { label: 'Total Bookings', value: '124', icon: '📅' },
    { label: 'Satisfaction', value: '92%', icon: '⭐' },
  ];

  const recentBookings = [
    { id: 1, driver: 'John Smith', vehicle: 'Tesla Model 3', date: '2026-04-12', amount: '$120' },
    { id: 2, driver: 'Sarah Johnson', vehicle: 'BMW iX3', date: '2026-04-11', amount: '$150' },
    { id: 3, driver: 'Mike Brown', vehicle: 'Tesla Model 3', date: '2026-04-10', amount: '$240' },
  ];

  const handleNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar currentPage="dashboard" onNavigate={handleNavigate} />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600 mt-2">Fleet Performance Overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vehicles Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Fleet</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  + Add Vehicle
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onSelect={setSelectedVehicle}
                    type="owner"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between items-start pb-3 border-b">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{booking.driver}</p>
                      <p className="text-xs text-gray-600">{booking.vehicle}</p>
                      <p className="text-xs text-gray-500 mt-1">{booking.date}</p>
                    </div>
                    <p className="font-bold text-green-600">{booking.amount}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-semibold">
                View All Bookings →
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition text-sm font-medium">
                  📊 View Analytics
                </button>
                <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition text-sm font-medium">
                  📍 Track Vehicles
                </button>
                <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition text-sm font-medium">
                  💬 Message Drivers
                </button>
                <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition text-sm font-medium">
                  ⚙️ Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;

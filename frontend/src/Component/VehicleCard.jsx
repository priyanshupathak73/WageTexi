import React from 'react';

const VehicleCard = ({ vehicle, onSelect, type = 'browser' }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition transform hover:scale-105">
      {/* Vehicle Image */}
      <div className="relative w-full h-40 bg-gray-200 overflow-hidden">
        <img
          src={vehicle.imageUrl || 'https://via.placeholder.com/300x200?text=' + vehicle.model}
          alt={vehicle.model}
          className="w-full h-full object-cover"
        />
        {vehicle.isAvailable && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            Available
          </div>
        )}
      </div>

      {/* Vehicle Details */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{vehicle.model}</h3>
        <p className="text-sm text-gray-600 mb-3">{vehicle.type}</p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-700">
          <div className="flex items-center">
            <span className="text-blue-600 mr-1">📍</span>
            {vehicle.location}
          </div>
          <div className="flex items-center">
            <span className="text-yellow-600 mr-1">⭐</span>
            {vehicle.rating || '4.5'} ({vehicle.reviews || 120})
          </div>
          <div className="flex items-center">
            <span className="text-green-600 mr-1">💰</span>
            ${vehicle.pricePerDay}/day
          </div>
          <div className="flex items-center">
            <span className="text-purple-600 mr-1">👥</span>
            {vehicle.capacity} seats
          </div>
        </div>

        {/* Owner/Driver Info */}
        {type === 'browser' && vehicle.ownerName && (
          <p className="text-xs text-gray-600 mb-4">Owner: {vehicle.ownerName}</p>
        )}

        {type === 'owner' && (
          <div className="text-xs text-gray-600 mb-4 space-y-1">
            <p>Status: <span className="font-bold text-green-600">{vehicle.status || 'Active'}</span></p>
            <p>Total Earnings: <span className="font-bold text-blue-600">${vehicle.earnings || 0}</span></p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={() => onSelect(vehicle)}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-md font-semibold hover:shadow-lg transition"
        >
          {type === 'browser' ? 'Book Now' : 'View Details'}
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;

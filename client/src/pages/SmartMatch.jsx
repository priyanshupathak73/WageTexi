import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { matchService, pricingService } from '../services';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, Users, Zap, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const MatchScore = ({ score }) => {
  const color =
    score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8">{score}</span>
    </div>
  );
};

const SmartMatch = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState({});

  useEffect(() => {
    matchService.getMatchedVehicles()
      .then(({ data }) => {
        setVehicles(data.vehicles);
        // Fetch dynamic prices in parallel for top 6 vehicles
        data.vehicles.slice(0, 6).forEach(async (v) => {
          try {
            const { data: priceData } = await pricingService.getDynamicPrice(v._id);
            setPrices((prev) => ({ ...prev, [v._id]: priceData.pricing }));
          } catch {
            // Price fetch can silently fail
          }
        });
      })
      .catch(() => toast.error('Failed to load matched vehicles'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="text-yellow-500" size={24} />
          AI-Matched Vehicles
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ranked by experience, rating, location, and vehicle preference
        </p>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No vehicles found for matching</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v, idx) => {
            const pricing = prices[v._id];
            return (
              <div
                key={v._id}
                className={`bg-white rounded-xl border p-5 hover:shadow-md transition-shadow ${
                  idx === 0 ? 'border-yellow-400 ring-1 ring-yellow-300' : 'border-gray-200'
                }`}
              >
                {idx === 0 && (
                  <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full mb-3">
                    🏆 Best Match
                  </span>
                )}
                {v.images?.[0] ? (
                  <img src={v.images[0]} alt={v.make} className="w-full h-32 object-cover rounded-lg mb-3 bg-gray-100" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3 text-3xl">
                    {v.type === 'auto' ? '🛺' : v.type === 'truck' ? '🚛' : '🚗'}
                  </div>
                )}

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{v.make} {v.model}</h3>
                    <p className="text-xs text-gray-500 capitalize">{v.year} · {v.type}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {v.isAvailable ? 'Available' : 'Booked'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><MapPin size={11} />{v.location?.city}</span>
                  <span className="flex items-center gap-1"><Users size={11} />{v.seatingCapacity} seats</span>
                  <span className="flex items-center gap-1"><Star size={11} />{v.averageRating?.toFixed(1) || '0.0'}</span>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Match Score</p>
                  <MatchScore score={v.matchScore} />
                </div>

                {pricing && (
                  <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Price/day</span>
                      <div className="text-right">
                        {pricing.isSurge ? (
                          <>
                            <span className="line-through text-gray-400 mr-1">₹{pricing.baseDaily}</span>
                            <span className="font-bold text-orange-600">₹{pricing.surgePrice}</span>
                            <span className="ml-1 text-orange-500 font-medium">{pricing.surgeMultiplier}×</span>
                          </>
                        ) : (
                          <span className="font-bold text-gray-900">₹{pricing.baseDaily}</span>
                        )}
                      </div>
                    </div>
                    {pricing.isSurge && pricing.reasons && (
                      <p className="text-orange-500 mt-1">{pricing.reasons[0]}</p>
                    )}
                  </div>
                )}

                <Link
                  to={`/vehicles/${v._id}`}
                  className="block w-full text-center bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  View & Book
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SmartMatch;

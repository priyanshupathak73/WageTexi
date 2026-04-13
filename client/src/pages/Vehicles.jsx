import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../services';
import { MapPin, Fuel, Users, IndianRupee, Search, SlidersHorizontal } from 'lucide-react';
import RatingStars from '../components/RatingStars';
import toast from 'react-hot-toast';

const vehicleTypes = ['', 'sedan', 'suv', 'hatchback', 'van', 'truck', 'auto', 'other'];
const fuelTypes = ['', 'petrol', 'diesel', 'cng', 'electric', 'hybrid'];

const VehicleCard = ({ vehicle }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div className="h-40 bg-gray-100 flex items-center justify-center text-4xl overflow-hidden">
      {vehicle.images && vehicle.images.length > 0 ? (
        <img src={vehicle.images[0]} alt={vehicle.make} className="w-full h-full object-cover" />
      ) : (
        vehicle.type === 'auto' ? '🛺' : vehicle.type === 'truck' ? '🚛' : '🚗'
      )}
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</h3>
          <p className="text-xs text-gray-500 capitalize">{vehicle.year} · {vehicle.type} · {vehicle.fuelType}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${vehicle.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {vehicle.isAvailable ? 'Available' : 'Booked'}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><MapPin size={12} />{vehicle.location?.city}</span>
        <span className="flex items-center gap-1"><Users size={12} />{vehicle.seatingCapacity} seats</span>
      </div>

      {vehicle.owner && (
        <div className="mt-2">
          <RatingStars rating={vehicle.owner.averageRating} size={12} />
          <p className="text-xs text-gray-500 mt-0.5">{vehicle.owner.businessName || vehicle.owner.name}</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div>
          <span className="text-lg font-bold text-gray-900">₹{vehicle.pricing?.daily?.toLocaleString()}</span>
          <span className="text-xs text-gray-400"> /day</span>
        </div>
        <Link
          to={`/vehicles/${vehicle._id}`}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          View Details
        </Link>
      </div>
    </div>
  </div>
);

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ city: '', type: '', minPrice: '', maxPrice: '', fuelType: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchVehicles = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const { data } = await vehicleService.getAll(params);
      setVehicles(data.vehicles);
      setTotal(data.total);
      setPage(p);
    } catch {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVehicles(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Vehicles</h1>
          <p className="text-sm text-gray-500 mt-1">{total} vehicles found</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 border border-gray-300 px-3 py-2 rounded-lg hover:border-blue-400"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {showFilters && (
        <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-5 mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
            <input value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="e.g. Mumbai"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {vehicleTypes.map((t) => <option key={t} value={t}>{t || 'All Types'}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Fuel</label>
            <select value={filters.fuelType} onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {fuelTypes.map((f) => <option key={f} value={f}>{f || 'All Fuels'}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Min Price/day</label>
            <input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              placeholder="₹"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Max Price/day</label>
            <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="₹"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-full flex justify-end">
            <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700">
              <Search size={14} /> Apply Filters
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🚗</p>
          <p className="font-medium">No vehicles found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vehicles.map((v) => <VehicleCard key={v._id} vehicle={v} />)}
          </div>
          {total > 12 && (
            <div className="flex justify-center gap-2 mt-8">
              <button disabled={page === 1} onClick={() => fetchVehicles(page - 1)}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:border-blue-400">
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page}</span>
              <button disabled={page * 12 >= total} onClick={() => fetchVehicles(page + 1)}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:border-blue-400">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Vehicles;

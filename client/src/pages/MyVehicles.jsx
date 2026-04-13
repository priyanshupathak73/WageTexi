import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const MyVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const { data } = await vehicleService.getMy();
      setVehicles(data.vehicles);
    } catch {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await vehicleService.delete(id);
      toast.success('Vehicle deleted');
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleAvailability = async (vehicle) => {
    try {
      await vehicleService.update(vehicle._id, { isAvailable: !vehicle.isAvailable });
      toast.success(`Vehicle marked as ${!vehicle.isAvailable ? 'available' : 'unavailable'}`);
      fetchVehicles();
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-40" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
        <Link
          to="/my-vehicles/add"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} /> Add Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🚗</p>
          <p className="font-medium">No vehicles yet</p>
          <Link to="/my-vehicles/add" className="mt-3 inline-block text-blue-600 text-sm hover:underline">Add your first vehicle →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((v) => (
            <div key={v._id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {v.images && v.images.length > 0 ? (
                    <img src={v.images[0]} alt={v.make} className="w-24 h-16 object-cover rounded-lg bg-gray-100" />
                  ) : (
                    <div className="w-24 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🚗</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{v.make} {v.model} <span className="text-gray-400 text-sm font-normal">({v.year})</span></h3>
                    <p className="text-sm text-gray-500 mt-0.5 capitalize">{v.type} · {v.fuelType} · {v.registrationNumber}</p>
                    <p className="text-sm text-gray-500">{v.location?.city} · {v.seatingCapacity} seats</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {v.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="text-sm font-bold text-gray-900">₹{v.pricing?.daily?.toLocaleString()}/day</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>Bookings: {v.totalBookings || 0}</span>
                <span>Earnings: ₹{v.totalEarnings?.toLocaleString() || 0}</span>
                {!v.isVerified && <span className="text-orange-500">⚠ Pending verification</span>}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleToggleAvailability(v)}
                  className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:border-blue-400"
                >
                  {v.isAvailable ? <ToggleRight size={15} className="text-green-500" /> : <ToggleLeft size={15} className="text-gray-400" />}
                  {v.isAvailable ? 'Set Unavailable' : 'Set Available'}
                </button>
                <Link
                  to={`/my-vehicles/edit/${v._id}`}
                  className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                >
                  <Edit size={13} /> Edit
                </Link>
                <button
                  onClick={() => handleDelete(v._id)}
                  className="flex items-center gap-1.5 text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVehicles;

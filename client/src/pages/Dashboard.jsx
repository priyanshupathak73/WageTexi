import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services';
import StatusBadge from '../components/StatusBadge';
import { IndianRupee, Car, BookOpen, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const service = user.role === 'owner'
          ? bookingService.getOwnerDashboard()
          : bookingService.getDriverDashboard();
        const res = await service;
        setData(res.data.dashboard);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user.role]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}</h1>
        <p className="text-gray-500 text-sm mt-1 capitalize">{user.role} Dashboard</p>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Bookings" value={data.totalBookings} icon={BookOpen} color="bg-blue-500" />
            <StatCard label="Pending" value={data.pendingBookings} icon={Clock} color="bg-yellow-500" />
            <StatCard label="Active" value={data.activeBookings} icon={Car} color="bg-green-500" />
            <StatCard label="Earnings" value={`₹${data.totalEarnings.toLocaleString()}`} icon={IndianRupee} color="bg-purple-500" />
          </div>

          {user.role === 'owner' && data.vehicles?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">My Vehicles</h2>
                <Link to="/my-vehicles" className="text-sm text-blue-600 hover:underline">Manage →</Link>
              </div>
              <div className="space-y-3">
                {data.vehicles.slice(0, 4).map((v) => (
                  <div key={v._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      {v.images && v.images.length > 0 ? (
                        <img src={v.images[0]} alt={v.make} className="w-12 h-8 object-cover rounded bg-gray-100" />
                      ) : (
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <Car size={16} className="text-gray-400" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-800">{v.make} {v.model}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">₹{v.totalEarnings?.toLocaleString() || 0}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${v.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {v.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.recentBookings?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
                <Link
                  to={user.role === 'owner' ? '/booking-requests' : '/bookings'}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {data.recentBookings.map((b) => (
                  <div key={b._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {b.vehicle?.make} {b.vehicle?.model}
                      </p>
                      <p className="text-xs text-gray-400">
                        {user.role === 'owner' ? `Driver: ${b.driver?.name}` : `Owner: ${b.owner?.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">₹{b.totalAmount?.toLocaleString()}</span>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.role === 'driver' && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-blue-900 mb-2">Ready to find a vehicle?</h3>
              <p className="text-sm text-blue-700 mb-4">Browse available vehicles in your area and send booking requests.</p>
              <Link to="/vehicles" className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Browse Vehicles →
              </Link>
            </div>
          )}

          {user.role === 'owner' && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <h3 className="font-semibold text-green-900 mb-2">List a new vehicle</h3>
              <p className="text-sm text-green-700 mb-4">Add vehicles to your fleet and start earning.</p>
              <Link to="/my-vehicles/add" className="inline-block bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                Add Vehicle →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

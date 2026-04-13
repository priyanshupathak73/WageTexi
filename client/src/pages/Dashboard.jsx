import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services';
import StatusBadge from '../components/StatusBadge';
import {
  IndianRupee, Car, BookOpen, Clock, CheckCircle,
  TrendingUp, Plus, ArrowRight, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Skeleton Loader ───────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded-xl ${className}`} />
);

const DashboardSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-32" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
    </div>
    <Skeleton className="h-64" />
    <Skeleton className="h-48" />
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const statConfig = [
  {
    key: 'totalBookings',
    label: 'Total Bookings',
    icon: BookOpen,
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
  },
  {
    key: 'pendingBookings',
    label: 'Pending',
    icon: Clock,
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
  },
  {
    key: 'activeBookings',
    label: 'Active',
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  {
    key: 'totalEarnings',
    label: 'Earnings',
    icon: IndianRupee,
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    border: 'border-violet-100',
    format: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`,
  },
];

const StatCard = ({ config, value }) => {
  const Icon = config.icon;
  const display = config.format ? config.format(value) : (value ?? 0);
  return (
    <div
      className={`bg-white rounded-2xl border ${config.border} p-5 
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-default`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{config.label}</p>
          <p className="text-3xl font-extrabold text-gray-900 truncate">{display}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shrink-0 shadow-sm`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className={`mt-4 flex items-center gap-1 ${config.text} text-xs font-medium`}>
        <TrendingUp size={12} />
        <span>Updated just now</span>
      </div>
    </div>
  );
};

// ─── Vehicle Card (Owner) ──────────────────────────────────────────────────────
const VehicleCard = ({ v }) => (
  <div className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-white 
    border border-transparent hover:border-gray-200 hover:shadow-md transition-all duration-200">
    {/* Thumbnail */}
    {v.images?.length > 0 ? (
      <img
        src={v.images[0]}
        alt={v.make}
        className="w-16 h-12 object-cover rounded-lg bg-gray-200 shrink-0"
      />
    ) : (
      <div className="w-16 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center shrink-0">
        <Car size={20} className="text-gray-400" />
      </div>
    )}

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 text-sm truncate">{v.make} {v.model}</p>
      <p className="text-xs text-gray-400 mt-0.5 capitalize">{v.type} · ₹{v.pricing?.daily?.toLocaleString('en-IN') || 0}/day</p>
    </div>

    {/* Status + Action */}
    <div className="flex items-center gap-3 shrink-0">
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
        v.isAvailable
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-red-100 text-red-700'
      }`}>
        {v.isAvailable ? '● Available' : '● Booked'}
      </span>
      <Link
        to={`/vehicles/${v._id}`}
        className="text-xs text-blue-600 font-semibold hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        View →
      </Link>
    </div>
  </div>
);

// ─── Booking Row ───────────────────────────────────────────────────────────────
const BookingRow = ({ b, role }) => (
  <Link
    to={`/bookings/${b._id}`}
    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50
      border border-transparent hover:border-gray-100 transition-all duration-150 group"
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
        <Car size={16} className="text-slate-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {b.vehicle?.make} {b.vehicle?.model}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {role === 'owner' ? `Driver: ${b.driver?.name}` : `Owner: ${b.owner?.name}`}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-gray-800">
        ₹{b.totalAmount?.toLocaleString('en-IN')}
      </span>
      <StatusBadge status={b.status} />
      <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
    </div>
  </Link>
);

// ─── CTA Banner ────────────────────────────────────────────────────────────────
const DriverCTA = () => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6">
    <div className="absolute inset-0 opacity-10"
      style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-white">Ready to earn today?</h3>
        <p className="text-sm text-blue-200 mt-1">Browse available vehicles in your area and start your next trip.</p>
      </div>
      <Link
        to="/smart-match"
        className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-5 py-2.5 
          rounded-xl hover:bg-blue-50 active:scale-95 transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap"
      >
        <Zap size={16} /> AI Match Me
      </Link>
    </div>
  </div>
);

const OwnerCTA = () => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-green-600 to-teal-700 p-6">
    <div className="absolute inset-0 opacity-10"
      style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-white">Grow your fleet</h3>
        <p className="text-sm text-emerald-100 mt-1">Add more vehicles and maximize your daily earnings.</p>
      </div>
      <Link
        to="/my-vehicles/add"
        className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold text-sm px-5 py-2.5 
          rounded-xl hover:bg-emerald-50 active:scale-95 transition-all shadow-lg shadow-green-900/20 whitespace-nowrap"
      >
        <Plus size={16} /> Add Vehicle
      </Link>
    </div>
  </div>
);

// ─── Main Dashboard ────────────────────────────────────────────────────────────
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

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {user.role} Dashboard
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            Welcome back, {user.name} 👋
          </h1>
        </div>
      </div>

      {data && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statConfig.map((cfg) => (
              <StatCard key={cfg.key} config={cfg} value={data[cfg.key]} />
            ))}
          </div>

          {/* Vehicles Section (Owner only) */}
          {user.role === 'owner' && data.vehicles?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car size={16} className="text-blue-600" />
                  </div>
                  <h2 className="font-bold text-gray-900">My Vehicles</h2>
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {data.vehicles.length}
                  </span>
                </div>
                <Link
                  to="/my-vehicles"
                  className="text-sm text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1"
                >
                  Manage <ArrowRight size={14} />
                </Link>
              </div>
              <div className="space-y-2">
                {data.vehicles.slice(0, 4).map((v) => (
                  <VehicleCard key={v._id} v={v} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Bookings */}
          {data.recentBookings?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BookOpen size={16} className="text-purple-600" />
                  </div>
                  <h2 className="font-bold text-gray-900">Recent Bookings</h2>
                </div>
                <Link
                  to={user.role === 'owner' ? '/booking-requests' : '/bookings'}
                  className="text-sm text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1"
                >
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="space-y-1">
                {data.recentBookings.map((b) => (
                  <BookingRow key={b._id} b={b} role={user.role} />
                ))}
              </div>
            </div>
          )}

          {/* CTA Banners */}
          {user.role === 'driver' && <DriverCTA />}
          {user.role === 'owner' && <OwnerCTA />}
        </>
      )}
    </div>
  );
};

export default Dashboard;

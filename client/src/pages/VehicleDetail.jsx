import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService, bookingService } from '../services';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import toast from 'react-hot-toast';
import { MapPin, Fuel, Users, Phone, Calendar, ArrowLeft } from 'lucide-react';

const VehicleDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ startDate: '', endDate: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    vehicleService.getOne(id)
      .then(({ data }) => setVehicle(data.vehicle))
      .catch(() => toast.error('Vehicle not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const totalDays = booking.startDate && booking.endDate
    ? Math.max(0, Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / 86400000))
    : 0;

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'driver') { toast.error('Only drivers can book vehicles'); return; }
    if (totalDays <= 0) { toast.error('Invalid date range'); return; }

    setSubmitting(true);
    try {
      await bookingService.create({ vehicleId: id, ...booking });
      toast.success('Booking request sent successfully!');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="h-6 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
    );
  }

  if (!vehicle) return <div className="text-center py-16 text-gray-500">Vehicle not found</div>;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Vehicle images */}
          {vehicle.images && vehicle.images.length > 0 && (
            <div className="h-64 sm:h-80 w-full rounded-xl overflow-hidden bg-gray-100">
              <img src={vehicle.images[0]} alt={vehicle.make} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Vehicle header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{vehicle.make} {vehicle.model}</h1>
                <p className="text-gray-500 text-sm mt-1">{vehicle.year} · {vehicle.registrationNumber}</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${vehicle.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {vehicle.isAvailable ? 'Available' : 'Not Available'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Type</p>
                <p className="text-sm font-medium capitalize">{vehicle.type}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Fuel</p>
                <p className="text-sm font-medium capitalize">{vehicle.fuelType}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-1">Seats</p>
                <p className="text-sm font-medium">{vehicle.seatingCapacity}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><MapPin size={14} />{vehicle.location?.city}, {vehicle.location?.state}</span>
            </div>

            {vehicle.features?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {vehicle.features.map((f) => (
                  <span key={f} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{f}</span>
                ))}
              </div>
            )}
          </div>

          {/* Owner info */}
          {vehicle.owner && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Owner Details</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{vehicle.owner.businessName || vehicle.owner.name}</p>
                  <RatingStars rating={vehicle.owner.averageRating} size={14} />
                </div>
                {vehicle.owner.phone && (
                  <a href={`tel:${vehicle.owner.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Phone size={14} /> {vehicle.owner.phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Pricing</h2>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-400">Daily Rate</p>
                <p className="text-2xl font-bold text-gray-900">₹{vehicle.pricing?.daily?.toLocaleString()}</p>
              </div>
              {vehicle.pricing?.weekly && (
                <div>
                  <p className="text-xs text-gray-400">Weekly Rate</p>
                  <p className="text-2xl font-bold text-gray-900">₹{vehicle.pricing.weekly.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking form */}
        {user?.role === 'driver' && vehicle.isAvailable && (
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={16} /> Book This Vehicle
              </h2>
              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Start Date</label>
                  <input type="date" min={today}
                    value={booking.startDate}
                    onChange={(e) => setBooking({ ...booking, startDate: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">End Date</label>
                  <input type="date" min={booking.startDate || today}
                    value={booking.endDate}
                    onChange={(e) => setBooking({ ...booking, endDate: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Notes (optional)</label>
                  <textarea rows={3} value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>

                {totalDays > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{totalDays} day{totalDays > 1 ? 's' : ''} × ₹{vehicle.pricing?.daily}</span>
                      <span className="font-bold text-blue-700">₹{(totalDays * vehicle.pricing?.daily).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={submitting}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                  {submitting ? 'Sending Request...' : 'Send Booking Request'}
                </button>
              </form>
            </div>
          </div>
        )}

        {!user && (
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-600 mb-4">Login as a driver to book this vehicle.</p>
              <a href="/login" className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
                Login to Book
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetail;

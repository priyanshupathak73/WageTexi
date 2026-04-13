import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Calendar, IndianRupee } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchBookings = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await bookingService.getMy(params);
      setBookings(data.bookings);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingService.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const statuses = ['', 'pending', 'approved', 'active', 'completed', 'cancelled', 'rejected'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <Link to="/vehicles" className="text-sm text-blue-600 hover:underline">+ New Booking</Link>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap capitalize transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-blue-400'
            }`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No bookings found</p>
          <Link to="/vehicles" className="mt-3 inline-block text-blue-600 text-sm hover:underline">Browse vehicles →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {b.vehicle?.make} {b.vehicle?.model}
                    <span className="text-gray-400 text-sm font-normal ml-2 capitalize">({b.vehicle?.type})</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">Owner: {b.owner?.name}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {format(new Date(b.startDate), 'dd MMM yyyy')} – {format(new Date(b.endDate), 'dd MMM yyyy')}
                </span>
                <span className="flex items-center gap-1.5">
                  <IndianRupee size={14} />
                  ₹{b.totalAmount?.toLocaleString()} · {b.totalDays} day{b.totalDays > 1 ? 's' : ''}
                </span>
                <StatusBadge status={b.paymentStatus} />
              </div>

              {b.rejectionReason && (
                <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  Rejection reason: {b.rejectionReason}
                </p>
              )}

              <div className="flex gap-3 mt-4">
                <Link to={`/bookings/${b._id}`} className="text-sm text-blue-600 hover:underline">View Details →</Link>
                {['pending', 'approved'].includes(b.status) && (
                  <button onClick={() => handleCancel(b._id)}
                    className="text-sm text-red-500 hover:underline">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;

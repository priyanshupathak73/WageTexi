import { useEffect, useState } from 'react';
import { bookingService } from '../services';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Calendar, IndianRupee, CheckCircle, XCircle } from 'lucide-react';

const BookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [rejecting, setRejecting] = useState({ id: null, reason: '' });

  const fetchRequests = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await bookingService.getRequests(params);
      setBookings(data.bookings);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleApprove = async (id) => {
    try {
      await bookingService.respond(id, { action: 'approved' });
      toast.success('Booking approved');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if (!rejecting.reason.trim()) { toast.error('Please provide a rejection reason'); return; }
    try {
      await bookingService.respond(id, { action: 'rejected', rejectionReason: rejecting.reason });
      toast.success('Booking rejected');
      setRejecting({ id: null, reason: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this booking as completed?')) return;
    try {
      await bookingService.complete(id);
      toast.success('Booking completed');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    }
  };

  const handlePayment = async (id, paymentStatus) => {
    try {
      await bookingService.updatePayment(id, { paymentStatus });
      toast.success(`Payment marked as ${paymentStatus}`);
      fetchRequests();
    } catch {
      toast.error('Payment update failed');
    }
  };

  const statuses = ['', 'pending', 'approved', 'active', 'completed', 'rejected'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
        <Link to="/my-vehicles/add" className="text-sm text-blue-600 hover:underline">+ Add Vehicle</Link>
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
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📩</p>
          <p className="font-medium">No booking requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {b.vehicle?.make} {b.vehicle?.model}
                    <span className="text-gray-400 text-xs font-normal ml-2">{b.vehicle?.registrationNumber}</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Driver: <span className="font-medium">{b.driver?.name}</span>
                    {b.driver?.licenseNumber && <span className="text-gray-400 ml-2">License: {b.driver.licenseNumber}</span>}
                    {b.driver?.experienceYears != null && <span className="text-gray-400 ml-2">{b.driver.experienceYears}yr exp</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.paymentStatus} />
                  <StatusBadge status={b.status} />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {format(new Date(b.startDate), 'dd MMM yyyy')} – {format(new Date(b.endDate), 'dd MMM yyyy')}
                </span>
                <span className="flex items-center gap-1.5">
                  <IndianRupee size={13} />
                  ₹{b.totalAmount?.toLocaleString()} · {b.totalDays} day{b.totalDays > 1 ? 's' : ''}
                </span>
              </div>

              {b.notes && (
                <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">Note: {b.notes}</p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-4">
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(b._id)}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700">
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button onClick={() => setRejecting({ id: b._id, reason: '' })}
                      className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-600">
                      <XCircle size={14} /> Reject
                    </button>
                  </>
                )}

                {b.status === 'approved' && (
                  <button onClick={() => handleComplete(b._id)}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                    Mark Completed
                  </button>
                )}

                {b.status === 'completed' && b.paymentStatus === 'unpaid' && (
                  <button onClick={() => handlePayment(b._id, 'paid')}
                    className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-purple-700">
                    Mark as Paid
                  </button>
                )}

                <Link to={`/bookings/${b._id}`} className="text-sm text-blue-600 hover:underline self-center">
                  View Details
                </Link>
              </div>

              {/* Rejection reason input */}
              {rejecting.id === b._id && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={rejecting.reason}
                    onChange={(e) => setRejecting({ ...rejecting, reason: e.target.value })}
                    placeholder="Reason for rejection..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <button onClick={() => handleReject(b._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
                    Confirm
                  </button>
                  <button onClick={() => setRejecting({ id: null, reason: '' })}
                    className="text-sm text-gray-500 hover:text-gray-700 px-2">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingRequests;

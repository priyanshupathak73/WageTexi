import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { bookingService, reviewService } from '../services';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBooking = async () => {
    try {
      const { data } = await bookingService.getOne(id);
      setBooking(data.booking);
    } catch {
      toast.error('Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooking(); }, [id]);

  const canReview = booking?.status === 'completed' && (
    (user?.role === 'driver' && !booking.driverReviewed) ||
    (user?.role === 'owner' && !booking.ownerReviewed)
  );

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const reviewType = user.role === 'driver' ? 'driver_to_owner' : 'owner_to_driver';
      await reviewService.create({ bookingId: id, ...review, reviewType });
      toast.success('Review submitted!');
      fetchBooking();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-8"><div className="h-48 bg-gray-100 rounded-xl animate-pulse" /></div>;
  if (!booking) return <div className="text-center py-16 text-gray-500">Booking not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Booking Details</h1>
          <div className="flex gap-2">
            <StatusBadge status={booking.paymentStatus} />
            <StatusBadge status={booking.status} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">Vehicle</h3>
            <p className="font-semibold text-gray-900">{booking.vehicle?.make} {booking.vehicle?.model}</p>
            <p className="text-sm text-gray-500 capitalize">{booking.vehicle?.type} · {booking.vehicle?.registrationNumber}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">Duration</h3>
            <p className="font-semibold text-gray-900">
              {format(new Date(booking.startDate), 'dd MMM yyyy')} – {format(new Date(booking.endDate), 'dd MMM yyyy')}
            </p>
            <p className="text-sm text-gray-500">{booking.totalDays} day{booking.totalDays > 1 ? 's' : ''}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">Driver</h3>
            <p className="font-semibold text-gray-900">{booking.driver?.name}</p>
            <p className="text-sm text-gray-500">{booking.driver?.phone}</p>
          </div>
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">Owner</h3>
            <p className="font-semibold text-gray-900">{booking.owner?.name}</p>
            <p className="text-sm text-gray-500">{booking.owner?.phone}</p>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm text-gray-500">Total Amount</span>
          <span className="text-2xl font-bold text-gray-900">₹{booking.totalAmount?.toLocaleString()}</span>
        </div>

        {booking.rejectionReason && (
          <div className="mt-4 bg-red-50 rounded-lg px-4 py-3 text-sm text-red-700">
            Rejection reason: {booking.rejectionReason}
          </div>
        )}

        {booking.notes && (
          <div className="mt-4 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
            Notes: {booking.notes}
          </div>
        )}
      </div>

      {canReview && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star size={16} className="text-yellow-400" />
            Leave a Review
          </h2>
          <form onSubmit={handleReview} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setReview({ ...review, rating: r })}>
                    <Star size={24} className={r <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Comment</label>
              <textarea rows={3} value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })}
                placeholder="Share your experience..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <button type="submit" disabled={submittingReview}
              className="bg-yellow-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-60">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookingDetail;

const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment, reviewType } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return next(new AppError('Booking not found', 404));
    if (booking.status !== 'completed') return next(new AppError('Can only review completed bookings', 400));

    if (reviewType === 'driver_to_owner') {
      if (booking.driver.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
      }
      if (booking.driverReviewed) return next(new AppError('You have already reviewed this booking', 400));
    }

    if (reviewType === 'owner_to_driver') {
      if (booking.owner.toString() !== req.user._id.toString()) {
        return next(new AppError('Not authorized', 403));
      }
      if (booking.ownerReviewed) return next(new AppError('You have already reviewed this booking', 400));
    }

    const revieweeId = reviewType === 'driver_to_owner' ? booking.owner : booking.driver;

    const review = await Review.create({
      booking: bookingId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      vehicle: booking.vehicle,
      rating,
      comment,
      reviewType,
    });

    // Update booking reviewed flag
    if (reviewType === 'driver_to_owner') booking.driverReviewed = true;
    if (reviewType === 'owner_to_driver') booking.ownerReviewed = true;
    await booking.save();

    // Recalculate reviewee average rating
    const stats = await Review.aggregate([
      { $match: { reviewee: revieweeId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(revieweeId, {
        averageRating: Math.round(stats[0].avg * 10) / 10,
        totalRatings: stats[0].count,
      });
    }

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name role profileImage')
      .populate('vehicle', 'make model')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
};

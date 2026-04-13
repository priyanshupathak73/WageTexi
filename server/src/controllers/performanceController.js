const User = require('../models/User');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');

/**
 * Performance Score Formula (0-100):
 *   completionRate  (40 pts max): completedTrips / totalTrips * 40
 *   rating          (30 pts max): (avgRating / 5) * 30
 *   experience      (20 pts max): min(experience, 10) / 10 * 20
 *   lowCancellation (10 pts max): (1 - cancelRate) * 10
 */
const calculateScore = (driver) => {
  const totalTrips = (driver.completedTrips || 0) + (driver.cancelledTrips || 0);
  const completionRate = totalTrips > 0 ? driver.completedTrips / totalTrips : 0;
  const cancelRate = totalTrips > 0 ? driver.cancelledTrips / totalTrips : 0;
  const exp = Math.min(driver.experienceYears || 0, 10);

  const completionPts = Math.round(completionRate * 40);
  const ratingPts = Math.round(((driver.averageRating || 0) / 5) * 30);
  const expPts = Math.round((exp / 10) * 20);
  const cancelPts = Math.round((1 - cancelRate) * 10);

  const total = completionPts + ratingPts + expPts + cancelPts;

  return {
    total: Math.min(total, 100),
    breakdown: {
      completionRate: `${Math.round(completionRate * 100)}%`,
      completionPts,
      ratingPts,
      expPts,
      cancelPts,
    },
  };
};

// @desc  Get driver performance score
// @route GET /api/drivers/:id/performance
// @access Private
exports.getPerformance = async (req, res, next) => {
  try {
    const driver = await User.findById(req.params.id).select(
      'name role experienceYears averageRating totalRatings completedTrips cancelledTrips performanceScore'
    );
    if (!driver) return next(new AppError('Driver not found', 404));
    if (driver.role !== 'driver') return next(new AppError('User is not a driver', 400));

    const { total, breakdown } = calculateScore(driver);

    res.json({
      success: true,
      driver: {
        id: driver._id,
        name: driver.name,
        averageRating: driver.averageRating,
        totalRatings: driver.totalRatings,
        experienceYears: driver.experienceYears,
        completedTrips: driver.completedTrips,
        cancelledTrips: driver.cancelledTrips,
      },
      performanceScore: total,
      breakdown,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Recompute and persist performance score (called internally after bookings change)
// @usage Called from bookingController on status change
exports.updatePerformanceScore = async (driverId) => {
  const driver = await User.findById(driverId);
  if (!driver || driver.role !== 'driver') return;

  const { total } = calculateScore(driver);
  await User.findByIdAndUpdate(driverId, { performanceScore: total });
};

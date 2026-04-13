const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Scoring algorithm weights:
 * - City match:           30 points
 * - Experience:           up to 25 points
 * - Rating:               up to 20 points
 * - Vehicle type pref:    15 points
 * - Performance score:    up to 10 points (normalised to 10)
 */
const scoreDriver = (driver, vehicle) => {
  let score = 0;

  // 1. City match (30 pts)
  const driverCity = driver.location?.city?.toLowerCase().trim();
  const vehicleCity = vehicle.location?.city?.toLowerCase().trim();
  if (driverCity && vehicleCity && driverCity === vehicleCity) score += 30;

  // 2. Experience (up to 25 pts, capped at 10 yrs)
  const exp = Math.min(driver.experienceYears || 0, 10);
  score += Math.round((exp / 10) * 25);

  // 3. Rating (up to 20 pts)
  const rating = driver.averageRating || 0;
  score += Math.round((rating / 5) * 20);

  // 4. Preferred vehicle type match (15 pts)
  if (driver.preferredVehicleType && driver.preferredVehicleType === vehicle.type) {
    score += 15;
  }

  // 5. Performance score contribution (up to 10 pts)
  const perf = Math.min(driver.performanceScore || 0, 100);
  score += Math.round((perf / 100) * 10);

  return score;
};

// @desc  Get best-matched vehicles for logged-in driver
// @route GET /api/match/vehicles
// @access Private (driver)
exports.getMatchedVehicles = async (req, res, next) => {
  try {
    const driver = await User.findById(req.user._id);
    if (!driver) return next(new AppError('Driver not found', 404));

    // Fetch all available vehicles (with owner populated for scoring)
    const vehicles = await Vehicle.find({ isAvailable: true })
      .populate('owner', 'name averageRating location businessName')
      .lean();

    // Score each vehicle based on driver profile
    const scored = vehicles.map((v) => ({
      ...v,
      matchScore: scoreDriver(driver, v),
    }));

    // Sort highest score first
    scored.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: scored.length,
      driver: {
        city: driver.location?.city,
        preferredVehicleType: driver.preferredVehicleType,
        experienceYears: driver.experienceYears,
        averageRating: driver.averageRating,
        performanceScore: driver.performanceScore,
      },
      vehicles: scored,
    });
  } catch (err) {
    next(err);
  }
};

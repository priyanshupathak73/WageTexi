const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');

/**
 * Surge multiplier rules (rule-based):
 * 1. Demand surge:  if active bookings > 5 in city → +20%
 * 2. Peak hours:    6-9am and 5-9pm → +15%
 * 3. Weekend:       Saturday/Sunday → +10%
 * Multipliers stack (max cap: 2.0x)
 */
const computeSurge = async (vehicle) => {
  let multiplier = 1.0;
  const reasons = [];

  // --- Demand surge ---
  const activeInCity = await Booking.countDocuments({
    status: 'active',
  }).lean();

  // Using a rough demand proxy: if 5+ active bookings globally, surge
  if (activeInCity >= 5) {
    multiplier += 0.2;
    reasons.push('High demand (+20%)');
  }

  // --- Peak hours (IST — UTC+5:30) ---
  const now = new Date();
  const istHour = (now.getUTCHours() + 5) % 24 + (now.getUTCMinutes() >= 30 ? 0 : 0);
  const utcHour = now.getUTCHours();
  // Peak hours in IST: 6-9am (UTC 0:30-3:30) and 5-9pm (UTC 11:30-15:30)
  const isPeakMorning = utcHour >= 0 && utcHour < 4;
  const isPeakEvening = utcHour >= 11 && utcHour < 16;
  if (isPeakMorning || isPeakEvening) {
    multiplier += 0.15;
    reasons.push('Peak hours (+15%)');
  }

  // --- Weekend surge ---
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0 || day === 6) {
    multiplier += 0.1;
    reasons.push('Weekend (+10%)');
  }

  // Cap at 2.0
  multiplier = Math.min(parseFloat(multiplier.toFixed(2)), 2.0);

  return { multiplier, reasons };
};

// @desc  Get dynamic price for a vehicle
// @route GET /api/vehicles/:id/price
// @access Public
exports.getDynamicPrice = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).select('pricing make model location');
    if (!vehicle) return next(new AppError('Vehicle not found', 404));

    const { multiplier, reasons } = await computeSurge(vehicle);
    const basePrice = vehicle.pricing.daily;
    const surgePrice = Math.round(basePrice * multiplier);

    res.json({
      success: true,
      vehicleId: vehicle._id,
      pricing: {
        baseDaily: basePrice,
        surgeMultiplier: multiplier,
        surgePrice,
        reasons,
        isSurge: multiplier > 1.0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Export the helper so bookingController can use it on create
exports.computeSurge = computeSurge;

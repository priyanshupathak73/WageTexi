const TripLocation = require('../models/TripLocation');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');

// @desc  Driver updates live location (also emits via Socket.io)
// @route POST /api/location/update
// @access Private (driver)
exports.updateLocation = async (req, res, next) => {
  try {
    const { bookingId, lat, lng, address } = req.body;

    if (!lat || !lng) return next(new AppError('lat and lng are required', 400));

    const booking = await Booking.findById(bookingId);
    if (!booking) return next(new AppError('Booking not found', 404));
    if (booking.driver.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the assigned driver can update location', 403));
    }
    if (booking.status !== 'active') {
      return next(new AppError('Trip is not active', 400));
    }

    const locationPoint = { lat: parseFloat(lat), lng: parseFloat(lng), timestamp: new Date() };

    // Upsert: create if first update, push to history on subsequent
    let trip = await TripLocation.findOne({ booking: bookingId });
    if (!trip) {
      trip = await TripLocation.create({
        booking: bookingId,
        driver: req.user._id,
        currentLocation: { lat: locationPoint.lat, lng: locationPoint.lng, address, updatedAt: new Date() },
        routeHistory: [locationPoint],
        startedAt: new Date(),
      });
    } else {
      trip.currentLocation = { lat: locationPoint.lat, lng: locationPoint.lng, address, updatedAt: new Date() };
      trip.routeHistory.push(locationPoint);
      // Keep last 500 points to prevent unbounded growth
      if (trip.routeHistory.length > 500) {
        trip.routeHistory = trip.routeHistory.slice(-500);
      }
      await trip.save();
    }

    // Emit real-time update to owner's room via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.owner.toString()}`).emit('trip:location', {
        bookingId,
        driverId: req.user._id,
        location: { lat: locationPoint.lat, lng: locationPoint.lng, address },
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Location updated',
      currentLocation: trip.currentLocation,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get current + route history for a trip
// @route GET /api/trip/:id/location
// @access Private
exports.getTripLocation = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found', 404));

    const userId = req.user._id.toString();
    const isParty =
      booking.driver.toString() === userId ||
      booking.owner.toString() === userId ||
      req.user.role === 'admin';

    if (!isParty) return next(new AppError('Not authorized to view this trip', 403));

    const trip = await TripLocation.findOne({ booking: req.params.id }).lean();
    if (!trip) {
      return res.json({ success: true, tracking: false, message: 'No location data yet' });
    }

    res.json({
      success: true,
      tracking: trip.isTracking,
      currentLocation: trip.currentLocation,
      routeHistory: trip.routeHistory,
      startedAt: trip.startedAt,
      endedAt: trip.endedAt,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Stop tracking (called when booking completes)
// @route PATCH /api/trip/:id/stop
// @access Private (driver)
exports.stopTracking = async (req, res, next) => {
  try {
    await TripLocation.findOneAndUpdate(
      { booking: req.params.id },
      { isTracking: false, endedAt: new Date() }
    );
    res.json({ success: true, message: 'Tracking stopped' });
  } catch (err) {
    next(err);
  }
};

const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @desc    Create booking request
// @route   POST /api/bookings
// @access  Private (driver)
exports.createBooking = async (req, res, next) => {
  try {
    const { vehicleId, startDate, endDate, notes } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return next(new AppError('Vehicle not found', 404));
    if (!vehicle.isAvailable) return next(new AppError('Vehicle is not available', 400));

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) return next(new AppError('End date must be after start date', 400));

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * vehicle.pricing.daily;

    // Check for overlapping bookings
    const overlap = await Booking.findOne({
      vehicle: vehicleId,
      status: { $in: ['approved', 'active'] },
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } },
      ],
    });

    if (overlap) return next(new AppError('Vehicle is already booked for these dates', 400));

    const booking = await Booking.create({
      driver: req.user._id,
      vehicle: vehicleId,
      owner: vehicle.owner,
      startDate: start,
      endDate: end,
      totalDays,
      totalAmount,
      notes,
    });

    const populated = await Booking.findById(booking._id)
      .populate('vehicle', 'make model registrationNumber type')
      .populate('owner', 'name phone');

    // Notify owner via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${vehicle.owner}`).emit('booking:new', {
        bookingId: booking._id,
        driver: req.user.name,
        vehicle: `${vehicle.make} ${vehicle.model}`,
      });
    }

    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get driver's bookings
// @route   GET /api/bookings/my
// @access  Private (driver)
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { driver: req.user._id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('vehicle', 'make model type registrationNumber images pricing')
        .populate('owner', 'name phone')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Booking.countDocuments(query),
    ]);

    res.json({ success: true, total, bookings });
  } catch (err) {
    next(err);
  }
};

// @desc    Get owner's booking requests
// @route   GET /api/bookings/requests
// @access  Private (owner)
exports.getBookingRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { owner: req.user._id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('vehicle', 'make model type registrationNumber')
        .populate('driver', 'name phone licenseNumber experienceYears averageRating')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Booking.countDocuments(query),
    ]);

    res.json({ success: true, total, bookings });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle', 'make model type registrationNumber images pricing location')
      .populate('driver', 'name phone licenseNumber experienceYears averageRating')
      .populate('owner', 'name phone businessName averageRating');

    if (!booking) return next(new AppError('Booking not found', 404));

    const isParty =
      booking.driver._id.toString() === req.user._id.toString() ||
      booking.owner._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isParty) return next(new AppError('Access denied', 403));

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve or reject booking
// @route   PUT /api/bookings/:id/respond
// @access  Private (owner)
exports.respondToBooking = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(action)) {
      return next(new AppError('Action must be approved or rejected', 400));
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found', 404));

    if (booking.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    if (booking.status !== 'pending') {
      return next(new AppError('Booking is no longer pending', 400));
    }

    booking.status = action;
    if (action === 'rejected') booking.rejectionReason = rejectionReason;
    await booking.save();

    if (action === 'approved') {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { isAvailable: false });
    }

    // Notify driver via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${booking.driver}`).emit('booking:responded', {
        bookingId: booking._id,
        status: action,
        rejectionReason,
      });
    }

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (driver)
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found', 404));

    if (booking.driver.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    if (!['pending', 'approved'].includes(booking.status)) {
      return next(new AppError('This booking cannot be cancelled', 400));
    }

    booking.status = 'cancelled';
    await booking.save();

    if (booking.status === 'approved') {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { isAvailable: true });
    }

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete booking and update earnings
// @route   PUT /api/bookings/:id/complete
// @access  Private (owner)
exports.completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found', 404));

    if (booking.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    if (booking.status !== 'active') {
      return next(new AppError('Booking must be active to complete', 400));
    }

    booking.status = 'completed';
    booking.paymentStatus = 'paid';
    await booking.save();

    await Vehicle.findByIdAndUpdate(booking.vehicle, {
      isAvailable: true,
      $inc: { totalBookings: 1, totalEarnings: booking.totalAmount },
    });

    await User.findByIdAndUpdate(booking.owner, { $inc: { totalEarnings: booking.totalAmount } });

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Update payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private (owner)
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new AppError('Booking not found', 404));

    if (booking.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    booking.paymentStatus = paymentStatus;
    if (paymentMethod) booking.paymentMethod = paymentMethod;
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Owner dashboard stats
// @route   GET /api/bookings/dashboard/owner
// @access  Private (owner)
exports.getOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const [totalBookings, pendingBookings, activeBookings, completedBookings, vehicles, recentBookings] = await Promise.all([
      Booking.countDocuments({ owner: ownerId }),
      Booking.countDocuments({ owner: ownerId, status: 'pending' }),
      Booking.countDocuments({ owner: ownerId, status: 'active' }),
      Booking.countDocuments({ owner: ownerId, status: 'completed' }),
      Vehicle.find({ owner: ownerId }).select('make model isAvailable totalEarnings totalBookings averageRating images'),
      Booking.find({ owner: ownerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('driver', 'name')
        .populate('vehicle', 'make model'),
    ]);

    const earningsResult = await Booking.aggregate([
      { $match: { owner: ownerId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const totalEarnings = earningsResult[0]?.total || 0;

    res.json({
      success: true,
      dashboard: {
        totalBookings,
        pendingBookings,
        activeBookings,
        completedBookings,
        totalEarnings,
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter((v) => v.isAvailable).length,
        vehicles,
        recentBookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Driver dashboard stats
// @route   GET /api/bookings/dashboard/driver
// @access  Private (driver)
exports.getDriverDashboard = async (req, res, next) => {
  try {
    const driverId = req.user._id;

    const [totalBookings, pendingBookings, activeBookings, completedBookings, recentBookings] = await Promise.all([
      Booking.countDocuments({ driver: driverId }),
      Booking.countDocuments({ driver: driverId, status: 'pending' }),
      Booking.countDocuments({ driver: driverId, status: 'active' }),
      Booking.countDocuments({ driver: driverId, status: 'completed' }),
      Booking.find({ driver: driverId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('vehicle', 'make model type')
        .populate('owner', 'name'),
    ]);

    const earningsResult = await Booking.aggregate([
      { $match: { driver: driverId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    const totalEarnings = earningsResult[0]?.total || 0;

    res.json({
      success: true,
      dashboard: {
        totalBookings,
        pendingBookings,
        activeBookings,
        completedBookings,
        totalEarnings,
        recentBookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

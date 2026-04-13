const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isVerified, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).select('-password').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.json({ success: true, total, users });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify user (admin)
// @route   PUT /api/admin/users/:id/verify
// @access  Private (admin)
exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) return next(new AppError('User not found', 404));
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user active status (admin)
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify vehicle (admin)
// @route   PUT /api/admin/vehicles/:id/verify
// @access  Private (admin)
exports.verifyVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!vehicle) return next(new AppError('Vehicle not found', 404));
    res.json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

// @desc    Get platform statistics (admin)
// @route   GET /api/admin/stats
// @access  Private (admin)
exports.getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalDrivers, totalOwners, totalVehicles, totalBookings, completedBookings, earningsResult] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ role: 'owner' }),
      Vehicle.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const platformRevenue = earningsResult[0]?.total || 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDrivers,
        totalOwners,
        totalVehicles,
        totalBookings,
        completedBookings,
        platformRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};

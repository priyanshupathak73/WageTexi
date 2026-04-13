const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Review = require('../models/Review');
const TripLocation = require('../models/TripLocation');
const AppError = require('../utils/AppError');

// @desc    Get driver earnings analytics
// @route   GET /api/analytics/driver/earnings
// @access  Private (driver)
exports.getDriverEarnings = async (req, res, next) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;
    
    const matchFilter = { driver: req.user._id, status: 'completed' };
    
    if (startDate && endDate) {
      matchFilter.endDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(matchFilter)
      .populate('vehicle')
      .sort({ endDate: -1 });

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalTrips = bookings.length;
    const averagePerTrip = totalTrips > 0 ? Math.round(totalEarnings / totalTrips) : 0;

    // Group by date for trend analysis
    const earningsByDate = {};
    bookings.forEach(booking => {
      const date = booking.endDate.toISOString().split('T')[0];
      earningsByDate[date] = (earningsByDate[date] || 0) + (booking.totalAmount || 0);
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEarnings,
          totalTrips,
          averagePerTrip,
          dateRange: { startDate, endDate }
        },
        earningsByDate,
        recentBookings: bookings.slice(0, 10).map(b => ({
          id: b._id,
          vehicleName: b.vehicle?.model,
          amount: b.totalAmount,
          date: b.endDate,
          duration: b.totalDays
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner earnings analytics
// @route   GET /api/analytics/owner/earnings
// @access  Private (owner)
exports.getOwnerEarnings = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchFilter = { owner: req.user._id, status: 'completed' };
    
    if (startDate && endDate) {
      matchFilter.endDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(matchFilter)
      .populate('vehicle')
      .sort({ endDate: -1 });

    const vehicles = await Vehicle.find({ owner: req.user._id });
    
    const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalTrips = bookings.length;
    const averagePerTrip = totalTrips > 0 ? Math.round(totalEarnings / totalTrips) : 0;

    // Earnings per vehicle
    const earningsByVehicle = {};
    bookings.forEach(booking => {
      const vId = booking.vehicle._id.toString();
      earningsByVehicle[vId] = {
        name: booking.vehicle.model,
        earnings: (earningsByVehicle[vId]?.earnings || 0) + (booking.totalAmount || 0),
        trips: (earningsByVehicle[vId]?.trips || 0) + 1
      };
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEarnings,
          totalTrips,
          averagePerTrip,
          totalVehicles: vehicles.length,
          dateRange: { startDate, endDate }
        },
        earningsByVehicle: Object.values(earningsByVehicle),
        recentBookings: bookings.slice(0, 10).map(b => ({
          id: b._id,
          driver: b.driver.fullName,
          vehicleName: b.vehicle?.model,
          amount: b.totalAmount,
          date: b.endDate,
          duration: b.totalDays
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vehicle usage analytics
// @route   GET /api/analytics/vehicle/:vehicleId/usage
// @access  Private
exports.getVehicleUsage = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const { startDate, endDate } = req.query;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return next(new AppError('Vehicle not found', 404));

    // Check authorization
    if (vehicle.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to view this vehicle analytics', 403));
    }

    const matchFilter = { vehicle: vehicleId, status: 'completed' };
    if (startDate && endDate) {
      matchFilter.endDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const bookings = await Booking.find(matchFilter)
      .populate('driver', 'fullName email averageRating')
      .sort({ endDate: -1 });

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalDaysRented = bookings.reduce((sum, b) => sum + b.totalDays, 0);
    const utilizationRate = vehicle.releaseYear ? 
      Math.round((totalDaysRented / 365) * 100) : 0;

    // Trip history with driver ratings
    const tripHistory = await Promise.all(
      bookings.map(async (b) => {
        const reviews = await Review.find({ 
          booking: b._id, 
          reviewer: b.driver._id 
        });
        return {
          id: b._id,
          driver: b.driver.fullName,
          driverRating: b.driver.averageRating,
          startDate: b.startDate,
          endDate: b.endDate,
          totalDays: b.totalDays,
          earnings: b.totalAmount,
          driverReview: reviews[0]?.rating || 'N/A'
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        vehicle: {
          name: vehicle.model,
          make: vehicle.make,
          year: vehicle.releaseYear,
          licensePlate: vehicle.licensePlate
        },
        summary: {
          totalEarnings,
          totalTrips: bookings.length,
          totalDaysRented,
          utilizationRate,
          averageEarningsPerDay: totalDaysRented > 0 ? 
            Math.round(totalEarnings / totalDaysRented) : 0
        },
        tripHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get driver performance analytics
// @route   GET /api/analytics/driver/performance
// @access  Private (driver)
exports.getDriverPerformance = async (req, res, next) => {
  try {
    const driver = await User.findById(req.user._id)
      .select('fullName performanceScore averageRating totalRatings completedTrips cancelledTrips totalEarnings');

    if (!driver) return next(new AppError('Driver not found', 404));

    // Get booking statistics
    const completedBookings = await Booking.countDocuments({
      driver: req.user._id,
      status: 'completed'
    });

    const totalBookings = await Booking.countDocuments({
      driver: req.user._id,
      status: { $in: ['completed', 'cancelled', 'rejected'] }
    });

    const cancelledBookings = totalBookings - completedBookings;
    const completionRate = totalBookings > 0 ? 
      Math.round((completedBookings / totalBookings) * 100) : 0;

    // Get recent reviews
    const reviews = await Review.find({ reviewer: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        profile: {
          name: driver.fullName,
          performanceScore: driver.performanceScore,
          averageRating: driver.averageRating,
          totalRatings: driver.totalRatings
        },
        statistics: {
          completedTrips: driver.completedTrips,
          cancelledTrips: driver.cancelledTrips,
          completionRate,
          totalEarnings: driver.totalEarnings,
          totalBookings
        },
        recentReviews: reviews.map(r => ({
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform dashboard analytics
// @route   GET /api/analytics/platform
// @access  Private (admin)
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(new AppError('Only admins can access platform analytics', 403));
    }

    const [
      totalUsers,
      totalDrivers,
      totalOwners,
      totalVehicles,
      totalBookings,
      completedBookings,
      totalEarnings,
      activeVehicles
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ role: 'owner' }),
      Vehicle.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Vehicle.countDocuments({ isAvailable: true })
    ]);

    const totalEarningsAmount = totalEarnings[0]?.total || 0;
    const platformCommission = Math.round(totalEarningsAmount * 0.10); // 10% commission

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          drivers: totalDrivers,
          owners: totalOwners
        },
        vehicles: {
          total: totalVehicles,
          active: activeVehicles
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          completionRate: totalBookings > 0 ? 
            Math.round((completedBookings / totalBookings) * 100) : 0
        },
        earnings: {
          total: totalEarningsAmount,
          platformCommission,
          averagePerBooking: completedBookings > 0 ? 
            Math.round(totalEarningsAmount / completedBookings) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real-time vehicle availability
// @route   GET /api/analytics/vehicles/availability
// @access  Private
exports.getVehicleAvailability = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ isAvailable: true })
      .populate('owner', 'fullName email')
      .select('make model licensePlate isAvailable pricing');

    const availableCount = vehicles.length;
    const totalVehicles = await Vehicle.countDocuments();
    const occupiedVehicles = totalVehicles - availableCount;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          available: availableCount,
          occupied: occupiedVehicles,
          total: totalVehicles,
          availabilityRate: totalVehicles > 0 ? 
            Math.round((availableCount / totalVehicles) * 100) : 0
        },
        vehicles: vehicles.map(v => ({
          id: v._id,
          name: `${v.make} ${v.model}`,
          licensePlate: v.licensePlate,
          owner: v.owner.fullName,
          dailyRate: v.pricing.daily,
          status: 'available'
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

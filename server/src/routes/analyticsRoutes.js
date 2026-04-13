const express = require('express');
const {
  getDriverEarnings,
  getOwnerEarnings,
  getVehicleUsage,
  getDriverPerformance,
  getPlatformAnalytics,
  getVehicleAvailability
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Driver analytics
router.get('/driver/earnings', getDriverEarnings);
router.get('/driver/performance', getDriverPerformance);

// Owner analytics
router.get('/owner/earnings', authorize('owner'), getOwnerEarnings);
router.get('/vehicle/:vehicleId/usage', getVehicleUsage);

// Vehicle availability (public for authenticated users)
router.get('/vehicles/availability', getVehicleAvailability);

// Admin analytics
router.get('/platform', authorize('admin'), getPlatformAnalytics);

module.exports = router;

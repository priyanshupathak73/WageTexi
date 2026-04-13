const express = require('express');
const router = express.Router();
const { updateLocation, getTripLocation, stopTracking } = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/update', protect, authorize('driver'), updateLocation);
router.get('/trip/:id', protect, getTripLocation);
router.patch('/trip/:id/stop', protect, authorize('driver'), stopTracking);

module.exports = router;

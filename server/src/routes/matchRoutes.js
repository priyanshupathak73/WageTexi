const express = require('express');
const router = express.Router();
const { getMatchedVehicles } = require('../controllers/matchController');
const { protect, authorize } = require('../middleware/auth');

router.get('/vehicles', protect, authorize('driver'), getMatchedVehicles);

module.exports = router;

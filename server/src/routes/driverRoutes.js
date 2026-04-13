const express = require('express');
const router = express.Router();
const { getPerformance } = require('../controllers/performanceController');
const { protect } = require('../middleware/auth');

router.get('/:id/performance', protect, getPerformance);

module.exports = router;

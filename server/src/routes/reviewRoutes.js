const express = require('express');
const { body } = require('express-validator');
const { createReview, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/', protect, [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('reviewType').isIn(['driver_to_owner', 'owner_to_driver']).withMessage('Invalid review type'),
], validate, createReview);

router.get('/user/:userId', getUserReviews);

module.exports = router;

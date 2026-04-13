const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getMyBookings,
  getBookingRequests,
  getBooking,
  respondToBooking,
  cancelBooking,
  completeBooking,
  updatePaymentStatus,
  getOwnerDashboard,
  getDriverDashboard,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/dashboard/owner', protect, authorize('owner'), getOwnerDashboard);
router.get('/dashboard/driver', protect, authorize('driver'), getDriverDashboard);

router.route('/')
  .post(protect, authorize('driver'), [
    body('vehicleId').notEmpty().withMessage('Vehicle ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
  ], validate, createBooking);

router.get('/my', protect, authorize('driver'), getMyBookings);
router.get('/requests', protect, authorize('owner'), getBookingRequests);

router.get('/:id', protect, getBooking);
router.put('/:id/respond', protect, authorize('owner'), [
  body('action').isIn(['approved', 'rejected']).withMessage('Action must be approved or rejected'),
], validate, respondToBooking);
router.put('/:id/cancel', protect, authorize('driver'), cancelBooking);
router.put('/:id/complete', protect, authorize('owner'), completeBooking);
router.put('/:id/payment', protect, authorize('owner'), [
  body('paymentStatus').isIn(['unpaid', 'paid', 'refunded']).withMessage('Invalid payment status'),
], validate, updatePaymentStatus);

module.exports = router;

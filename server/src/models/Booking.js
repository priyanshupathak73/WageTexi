const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalDays: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'mock'],
      default: 'mock',
    },
    notes: String,
    rejectionReason: String,
    ownerReviewed: {
      type: Boolean,
      default: false,
    },
    driverReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ driver: 1, status: 1 });
bookingSchema.index({ vehicle: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

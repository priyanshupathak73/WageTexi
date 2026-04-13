const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    // Snapshot of data at time of contract creation (immutable record)
    driverSnapshot: {
      name: String,
      email: String,
      phone: String,
      licenseNumber: String,
      experienceYears: Number,
    },
    vehicleSnapshot: {
      make: String,
      model: String,
      year: Number,
      registrationNumber: String,
      type: String,
      fuelType: String,
    },
    terms: {
      startDate: Date,
      endDate: Date,
      totalDays: Number,
      dailyRate: Number,
      totalAmount: Number,
      surgeMultiplier: { type: Number, default: 1.0 },
      paymentMethod: String,
    },
    // Legal clauses stored as array for flexibility
    clauses: [String],
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    signedByDriver: { type: Boolean, default: false },
    signedByOwner: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contractSchema.index({ booking: 1 });
contractSchema.index({ driver: 1 });
contractSchema.index({ owner: 1 });

module.exports = mongoose.model('Contract', contractSchema);

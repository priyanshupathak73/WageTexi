const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Vehicle year is required'],
    },
    type: {
      type: String,
      enum: ['sedan', 'suv', 'hatchback', 'van', 'truck', 'auto', 'other'],
      required: [true, 'Vehicle type is required'],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
    },
    registrationDocument: String,
    insuranceDocument: String,
    seatingCapacity: {
      type: Number,
      required: true,
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'cng', 'electric', 'hybrid'],
      required: true,
    },
    pricing: {
      daily: {
        type: Number,
        required: [true, 'Daily rate is required'],
      },
      weekly: {
        type: Number,
      },
    },
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: String,
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    images: [String],
    features: [String],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ 'location.city': 1, isAvailable: 1, type: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);

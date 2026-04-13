const mongoose = require('mongoose');

const tripLocationSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Current live location (updated in real-time)
    currentLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: String,
      updatedAt: { type: Date, default: Date.now },
    },
    // Full route history array
    routeHistory: [
      {
        lat: Number,
        lng: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    isTracking: { type: Boolean, default: true },
    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

tripLocationSchema.index({ booking: 1 });
tripLocationSchema.index({ driver: 1, isTracking: 1 });

module.exports = mongoose.model('TripLocation', tripLocationSchema);

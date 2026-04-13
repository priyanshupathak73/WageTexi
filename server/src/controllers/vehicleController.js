const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private (owner)
exports.createVehicle = async (req, res, next) => {
  try {
    const vehicleData = { ...req.body, owner: req.user._id };

    if (req.files) {
      if (req.files.registrationDocument) {
        vehicleData.registrationDocument = '/uploads/' + req.files.registrationDocument[0].filename;
      }
      if (req.files.insuranceDocument) {
        vehicleData.insuranceDocument = '/uploads/' + req.files.insuranceDocument[0].filename;
      }
      if (req.files.images) {
        vehicleData.images = req.files.images.map((f) => '/uploads/' + f.filename);
      }
    }

    const vehicle = await Vehicle.create(vehicleData);
    res.status(201).json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all available vehicles with filters
// @route   GET /api/vehicles
// @access  Public
exports.getVehicles = async (req, res, next) => {
  try {
    const { city, type, minPrice, maxPrice, fuelType, seating, page = 1, limit = 12 } = req.query;

    const query = { isAvailable: true };

    if (city) query['location.city'] = new RegExp(city, 'i');
    if (type) query.type = type;
    if (fuelType) query.fuelType = fuelType;
    if (seating) query.seatingCapacity = { $gte: Number(seating) };
    if (minPrice || maxPrice) {
      query['pricing.daily'] = {};
      if (minPrice) query['pricing.daily'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.daily'].$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .populate('owner', 'name averageRating businessName phone')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Vehicle.countDocuments(query),
    ]);

    const pages = total > 0 ? Math.ceil(total / Number(limit)) : 0;

    res.json({
      success: true,
      total,
      page: Number(page),
      pages,
      vehicles,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'name averageRating businessName phone location');
    if (!vehicle) return next(new AppError('Vehicle not found', 404));
    res.json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (owner)
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return next(new AppError('Vehicle not found', 404));

    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to update this vehicle', 403));
    }

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Emit socket event for availability change
    if (req.body.isAvailable !== undefined && req.app.get('io')) {
      req.app.get('io').emit('vehicle:availability', {
        vehicleId: vehicle._id,
        isAvailable: updated.isAvailable,
      });
    }

    res.json({ success: true, vehicle: updated });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (owner)
exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return next(new AppError('Vehicle not found', 404));

    if (vehicle.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to delete this vehicle', 403));
    }

    await vehicle.deleteOne();
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get owner's own vehicles
// @route   GET /api/vehicles/my/list
// @access  Private (owner)
exports.getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, vehicles });
  } catch (err) {
    next(err);
  }
};

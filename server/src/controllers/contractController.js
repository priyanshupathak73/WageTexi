const Contract = require('../models/Contract');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');

const DEFAULT_CLAUSES = [
  'The driver agrees to use the vehicle solely for lawful purposes.',
  'The driver is responsible for all traffic violations incurred during the rental period.',
  'Any damage to the vehicle during the rental period is the driver\'s responsibility.',
  'The owner guarantees the vehicle is roadworthy and fully insured.',
  'Either party may cancel with 24 hours notice before the rental start date.',
  'This contract is governed by the laws of India.',
];

// @desc  Create or return a contract for a booking
// @route POST /api/contracts/create
// @access Private (owner)
exports.createContract = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('driver', 'name email phone licenseNumber experienceYears')
      .populate('vehicle', 'make model year registrationNumber type fuelType pricing')
      .populate('owner', 'name email phone businessName');

    if (!booking) return next(new AppError('Booking not found', 404));
    if (booking.owner._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the booking owner can create contracts', 403));
    }
    if (booking.status !== 'approved') {
      return next(new AppError('Contract can only be created for approved bookings', 400));
    }

    // Return existing contract if already created
    const existing = await Contract.findOne({ booking: bookingId })
      .populate('driver', 'name email phone licenseNumber')
      .populate('vehicle', 'make model registrationNumber');
    if (existing) {
      return res.json({ success: true, contract: existing, alreadyExisted: true });
    }

    const contract = await Contract.create({
      booking: booking._id,
      driver: booking.driver._id,
      owner: booking.owner._id,
      vehicle: booking.vehicle._id,
      driverSnapshot: {
        name: booking.driver.name,
        email: booking.driver.email,
        phone: booking.driver.phone,
        licenseNumber: booking.driver.licenseNumber,
        experienceYears: booking.driver.experienceYears,
      },
      vehicleSnapshot: {
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        year: booking.vehicle.year,
        registrationNumber: booking.vehicle.registrationNumber,
        type: booking.vehicle.type,
        fuelType: booking.vehicle.fuelType,
      },
      terms: {
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalDays: booking.totalDays,
        dailyRate: booking.vehicle.pricing?.daily,
        totalAmount: booking.totalAmount,
        surgeMultiplier: booking.surgeMultiplier || 1.0,
        paymentMethod: booking.paymentMethod,
      },
      clauses: DEFAULT_CLAUSES,
    });

    // Store contract reference on booking
    await Booking.findByIdAndUpdate(bookingId, { contract: contract._id });

    res.status(201).json({ success: true, contract });
  } catch (err) {
    next(err);
  }
};

// @desc  Get a contract by ID or by booking ID
// @route GET /api/contracts/:id
// @access Private
exports.getContract = async (req, res, next) => {
  try {
    // Support ?booking=<bookingId> query
    let contract;
    if (req.query.booking) {
      contract = await Contract.findOne({ booking: req.query.booking }).lean();
    } else {
      contract = await Contract.findById(req.params.id).lean();
    }

    if (!contract) return next(new AppError('Contract not found', 404));

    // Ensure user is party to the contract
    const userId = req.user._id.toString();
    const isParty =
      contract.driver.toString() === userId ||
      contract.owner.toString() === userId ||
      req.user.role === 'admin';

    if (!isParty) return next(new AppError('Not authorized to view this contract', 403));

    res.json({ success: true, contract });
  } catch (err) {
    next(err);
  }
};

// @desc  Driver or Owner signs the contract
// @route PATCH /api/contracts/:id/sign
// @access Private
exports.signContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return next(new AppError('Contract not found', 404));

    const userId = req.user._id.toString();
    if (contract.driver.toString() === userId) {
      contract.signedByDriver = true;
    } else if (contract.owner.toString() === userId) {
      contract.signedByOwner = true;
    } else {
      return next(new AppError('Not a party to this contract', 403));
    }

    await contract.save();

    res.json({
      success: true,
      message: 'Contract signed successfully',
      signedByDriver: contract.signedByDriver,
      signedByOwner: contract.signedByOwner,
    });
  } catch (err) {
    next(err);
  }
};

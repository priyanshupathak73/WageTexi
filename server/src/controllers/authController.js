const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, location, licenseNumber, experienceYears, drivingCategories, businessName, gstNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const userData = { name, email, password, role, phone, location };

    if (role === 'driver') {
      userData.licenseNumber = licenseNumber;
      userData.experienceYears = experienceYears;
      userData.drivingCategories = drivingCategories;
    }

    if (role === 'owner') {
      userData.businessName = businessName;
      userData.gstNumber = gstNumber;
    }

    if (req.file) {
      userData.licenseDocument = '/uploads/' + req.file.filename;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account has been deactivated', 403));
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone,
        location: user.location,
        averageRating: user.averageRating,
        totalEarnings: user.totalEarnings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'location', 'businessName', 'drivingCategories'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.file) {
      updates.profileImage = '/uploads/' + req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

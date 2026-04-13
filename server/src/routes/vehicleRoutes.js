const express = require('express');
const { body } = require('express-validator');
const {
  createVehicle,
  getVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  getMyVehicles,
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { upload } = require('../config/cloudinary');

const router = express.Router();

const vehicleValidation = [
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('type').isIn(['sedan', 'suv', 'hatchback', 'van', 'truck', 'auto', 'other']).withMessage('Invalid vehicle type'),
  body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
  body('seatingCapacity').isInt({ min: 1, max: 50 }).withMessage('Valid seating capacity is required'),
  body('fuelType').isIn(['petrol', 'diesel', 'cng', 'electric', 'hybrid']).withMessage('Invalid fuel type'),
  body('pricing.daily').isNumeric().withMessage('Daily price is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
];

router.route('/')
  .get(getVehicles)
  .post(protect, authorize('owner'), upload.fields([
    { name: 'registrationDocument', maxCount: 1 },
    { name: 'insuranceDocument', maxCount: 1 },
    { name: 'images', maxCount: 5 },
  ]), vehicleValidation, validate, createVehicle);

router.get('/my/list', protect, authorize('owner'), getMyVehicles);

router.route('/:id')
  .get(getVehicle)
  .put(protect, authorize('owner'), updateVehicle)
  .delete(protect, authorize('owner'), deleteVehicle);

module.exports = router;

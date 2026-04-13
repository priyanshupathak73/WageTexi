const express = require('express');
const { getAllUsers, verifyUser, toggleUserStatus, verifyVehicle, getPlatformStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/toggle', toggleUserStatus);
router.put('/vehicles/:id/verify', verifyVehicle);

module.exports = router;

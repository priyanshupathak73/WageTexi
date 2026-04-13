const express = require('express');
const router = express.Router();
const { createContract, getContract, signContract } = require('../controllers/contractController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create', protect, authorize('owner'), createContract);
router.get('/:id', protect, getContract);
router.patch('/:id/sign', protect, signContract);

module.exports = router;

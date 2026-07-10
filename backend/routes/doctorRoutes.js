const express = require('express');
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Public routes
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

// Private routes (Doctor only)
router.get('/queue/today', auth, authorize('doctor'), doctorController.getTodayQueue);
router.put('/call-patient', auth, authorize('doctor'), doctorController.callNextPatient);
router.put('/complete-consultation/:tokenId', auth, authorize('doctor'), doctorController.completeConsultation);
router.get('/stats', auth, authorize('doctor'), doctorController.getDoctorStats);

module.exports = router;

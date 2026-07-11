const express = require('express');
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Private routes (Doctor only)
router.get('/stats', auth, authorize('doctor'), doctorController.getDoctorStats);
router.get('/queue/today', auth, authorize('doctor'), doctorController.getTodayQueue);
router.put('/call-patient', auth, authorize('doctor'), doctorController.callNextPatient);
router.put('/complete-consultation/:tokenId', auth, authorize('doctor'), doctorController.completeConsultation);
router.put('/availability', auth, authorize('doctor'), doctorController.updateAvailability);

// Public routes
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);

module.exports = router;

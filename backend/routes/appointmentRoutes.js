const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Patient routes (Patient only)
router.post('/', auth, authorize('patient'), appointmentController.bookAppointment);
router.get('/', auth, authorize('patient'), appointmentController.getMyAppointments);
router.put('/:id/cancel', auth, authorize('patient'), appointmentController.cancelAppointment);
router.put('/:id/reschedule', auth, authorize('patient'), appointmentController.rescheduleAppointment);

// Doctor routes (Doctor only)
router.get('/doctor', auth, authorize('doctor'), appointmentController.getDoctorAppointments);
router.put('/doctor/:id/complete', auth, authorize('doctor'), appointmentController.doctorCompleteAppointment);

// Admin routes (Admin only)
router.get('/admin', auth, authorize('admin'), appointmentController.getAllAppointments);
router.put('/admin/:id/approve', auth, authorize('admin'), appointmentController.approveAppointment);
router.put('/admin/:id/reject', auth, authorize('admin'), appointmentController.rejectAppointment);

module.exports = router;

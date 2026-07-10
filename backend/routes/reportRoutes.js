const express = require('express');
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Admin only routes for reporting
router.use(auth, authorize('admin'));

router.get('/patients', reportController.getPatientReport);
router.get('/appointments', reportController.getAppointmentReport);
router.get('/queues', reportController.getQueueReport);
router.get('/doctors', reportController.getDoctorReport);

module.exports = router;

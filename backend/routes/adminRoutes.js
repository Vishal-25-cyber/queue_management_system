const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// All routes are admin only
router.use(auth, authorize('admin'));

// Doctor routes
router.post('/doctors', adminController.addDoctor);
router.put('/doctors/:id', adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);

// Patient routes
router.get('/patients', adminController.getAllPatients);
router.post('/patients', adminController.addPatient);
router.get('/patients/:id', adminController.getPatientProfile);
router.put('/patients/:id', adminController.updatePatient);
router.delete('/patients/:id', adminController.deletePatient);

// Appointment routes
router.get('/appointments', adminController.getAllAppointments);

// Dashboard routes
router.get('/dashboard', adminController.getDashboardStats);
router.get('/queue-status', adminController.getQueueStatus);

module.exports = router;

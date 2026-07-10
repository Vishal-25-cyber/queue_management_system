const express = require('express');
const adminQueueController = require('../controllers/adminQueueController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// All routes are admin only
router.use(auth, authorize('admin'));

router.post('/generate-token', adminQueueController.generateManualToken);
router.put('/call-patient', adminQueueController.callPatient);
router.put('/start-consultation/:tokenId', adminQueueController.startConsultation);
router.put('/skip-patient/:tokenId', adminQueueController.skipPatient);
router.put('/complete-consultation/:tokenId', adminQueueController.completeConsultation);
router.put('/reset-queue', adminQueueController.resetQueue);

module.exports = router;

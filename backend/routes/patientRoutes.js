const express = require('express');
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Private routes (Patient only)
router.post('/book-token', auth, authorize('patient'), patientController.bookToken);
router.get('/my-token', auth, authorize('patient'), patientController.getMyToken);
router.get('/queue-status/:tokenId', auth, authorize('patient'), patientController.getQueueStatus);
router.put('/cancel-token/:tokenId', auth, authorize('patient'), patientController.cancelToken);
router.post('/add-review', auth, authorize('patient'), patientController.addReview);

module.exports = router;

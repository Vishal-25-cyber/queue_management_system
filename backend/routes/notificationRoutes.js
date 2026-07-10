const express = require('express');
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth); // Must be authenticated to access notifications

router.get('/', notificationController.getMyNotifications);
router.put('/read-all', notificationController.markAllRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;

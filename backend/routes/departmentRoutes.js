const express = require('express');
const departmentController = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// General fetch is open (publicly accessible so unregistered guests/registering users can view)
router.get('/', departmentController.getDepartments);

// Admin-only operations
router.get('/stats', auth, authorize('admin'), departmentController.getDepartmentStats);
router.post('/', auth, authorize('admin'), departmentController.addDepartment);
router.put('/:id', auth, authorize('admin'), departmentController.updateDepartment);
router.delete('/:id', auth, authorize('admin'), departmentController.deleteDepartment);

module.exports = router;

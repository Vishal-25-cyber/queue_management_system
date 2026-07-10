const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Token = require('../models/Token');

// @desc    Add new department
// @route   POST /api/admin/departments
// @access  Private (Admin only)
exports.addDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required',
      });
    }

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists',
      });
    }

    const department = await Department.create({ name, description });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private (Admin/Patient)
exports.getDepartments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.activeOnly === 'true') {
      filter.isActive = true;
    }

    const departments = await Department.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update department
// @route   PUT /api/admin/departments/:id
// @access  Private (Admin only)
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    let department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    if (name) {
      const duplicate = await Department.findOne({ name, _id: { $ne: req.params.id } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Another department with this name already exists',
        });
      }
      department.name = name;
    }

    if (description !== undefined) department.description = description;
    if (isActive !== undefined) department.isActive = isActive;

    department = await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete department (deactivate)
// @route   DELETE /api/admin/departments/:id
// @access  Private (Admin only)
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Set active status to false instead of hard deletion to maintain history
    department.isActive = false;
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get department dashboard statistics
// @route   GET /api/admin/departments/stats
// @access  Private (Admin only)
exports.getDepartmentStats = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Promise.all(
      departments.map(async dept => {
        const doctors = await Doctor.find({ department: dept._id, isActive: true });
        const doctorIds = doctors.map(d => d._id);

        const totalDoctors = doctors.length;

        const activeQueues = await Token.countDocuments({
          doctorId: { $in: doctorIds },
          status: { $in: ['waiting', 'called', 'in-consultation'] },
          date: { $gte: today },
        });

        // Get unique patients count today
        const patientIds = await Token.find({
          doctorId: { $in: doctorIds },
          date: { $gte: today },
        }).distinct('patientId');

        return {
          departmentId: dept._id,
          name: dept.name,
          description: dept.description,
          totalDoctors,
          totalPatients: patientIds.length,
          activeQueues,
        };
      })
    );

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

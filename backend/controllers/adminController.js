const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Token = require('../models/Token');

// @desc    Add new doctor
// @route   POST /api/admin/doctors
// @access  Private (Admin only)
exports.addDoctor = async (req, res, next) => {
  try {
    const { name, email, password, phone, department, qualifications, experience, consultationFee, bio } = req.body;

    // Validate
    if (!name || !email || !password || !phone || !department || !qualifications || !experience) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use',
      });
    }

    // Create user with doctor role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'doctor',
    });

    // Create doctor record
    const doctor = await Doctor.create({
      userId: user._id,
      name,
      department,
      qualifications,
      experience: Number(experience),
      consultationFee: Number(consultationFee) || 500,
      bio: bio || '',
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update doctor
// @route   PUT /api/admin/doctors/:id
// @access  Private (Admin only)
exports.updateDoctor = async (req, res, next) => {
  try {
    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Update allowed fields
    const { qualifications, experience, consultationFee, availability, bio, isActive } = req.body;

    if (qualifications !== undefined) doctor.qualifications = qualifications;
    if (experience !== undefined) doctor.experience = experience;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (availability !== undefined) doctor.availability = availability;
    if (bio !== undefined) doctor.bio = bio;
    if (isActive !== undefined) doctor.isActive = isActive;

    doctor = await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete (deactivate) doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private (Admin only)
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Mark doctor as inactive instead of deleting
    doctor.isActive = false;
    await doctor.save();

    // Also deactivate the user account
    await User.findByIdAndUpdate(doctor.userId, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Doctor deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private (Admin only)
// @desc    Get all patients (with pagination, search, status filter)
// @route   GET /api/admin/patients
// @access  Private (Admin only)
exports.getAllPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'patient' };

    // Search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Active status filter
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    const total = await User.countDocuments(query);
    const patients = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: patients.length,
      patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add new patient
// @route   POST /api/admin/patients
// @access  Private (Admin only)
exports.addPatient = async (req, res, next) => {
  try {
    const { name, email, password, phone, age, gender } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone number',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use',
      });
    }

    const patient = await User.create({
      name,
      email,
      password,
      phone,
      age: Number(age) || null,
      gender: gender || null,
      role: 'patient',
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        isActive: patient.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update patient
// @route   PUT /api/admin/patients/:id
// @access  Private (Admin only)
exports.updatePatient = async (req, res, next) => {
  try {
    let patient = await User.findOne({ _id: req.params.id, role: 'patient' });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const { name, email, phone, age, gender, isActive } = req.body;

    if (name !== undefined) patient.name = name;
    if (email !== undefined) {
      const duplicate = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another user',
        });
      }
      patient.email = email;
    }
    if (phone !== undefined) patient.phone = phone;
    if (age !== undefined) patient.age = Number(age) || null;
    if (gender !== undefined) patient.gender = gender || null;
    if (isActive !== undefined) patient.isActive = isActive;

    patient = await patient.save();

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete patient (deactivate)
// @route   DELETE /api/admin/patients/:id
// @access  Private (Admin only)
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    patient.isActive = false;
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Patient deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get patient profile with appointment and token logs
// @route   GET /api/admin/patients/:id
// @access  Private (Admin only)
exports.getPatientProfile = async (req, res, next) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' }).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({ patientId: patient._id })
      .populate('doctorId', 'name department')
      .sort({ appointmentDate: -1 });

    const tokens = await Token.find({ patientId: patient._id })
      .populate('doctorId', 'name department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      patient,
      appointments,
      tokens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all appointments (today's tokens)
// @route   GET /api/admin/appointments
// @access  Private (Admin only)
exports.getAllAppointments = async (req, res, next) => {
  try {
    const tokens = await Token.find()
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name department')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: tokens.length,
      appointments: tokens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await Doctor.countDocuments({ isActive: true });
    const activeQueues = await Token.countDocuments({
      status: { $in: ['waiting', 'called'] },
      date: { $gte: today },
    });
    const completedConsultations = await Token.countDocuments({
      status: 'completed',
      date: { $gte: today },
    });
    const totalTokensAllTime = await Token.countDocuments();

    const stats = {
      totalPatients,
      totalDoctors,
      activeQueues,
      completedConsultations,
      totalAppointments: totalTokensAllTime,
    };

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

// @desc    Get queue status for all doctors
// @route   GET /api/admin/queue-status
// @access  Private (Admin only)
exports.getQueueStatus = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const doctors = await Doctor.find({ isActive: true });

    const queueData = await Promise.all(
      doctors.map(async doctor => {
        const waitingCount = await Token.countDocuments({
          doctorId: doctor._id,
          status: 'waiting',
          date: { $gte: today },
        });

        const completedCount = await Token.countDocuments({
          doctorId: doctor._id,
          status: 'completed',
          date: { $gte: today },
        });

        const calledCount = await Token.countDocuments({
          doctorId: doctor._id,
          status: 'called',
          date: { $gte: today },
        });

        return {
          doctorId: doctor._id,
          doctorName: doctor.name,
          department: doctor.department,
          qualifications: doctor.qualifications,
          experience: doctor.experience,
          consultationFee: doctor.consultationFee,
          rating: doctor.rating,
          waitingPatients: waitingCount,
          calledPatients: calledCount,
          completedConsultations: completedCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      queueData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

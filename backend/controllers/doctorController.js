const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Token = require('../models/Token');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .populate('userId', 'name email phone')
      .populate('department', 'name')
      .lean();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const doctorsWithTokenCounts = await Promise.all(
      doctors.map(async (doc) => {
        const tokensBookedToday = await Token.countDocuments({
          doctorId: doc._id,
          date: { $gte: today },
          status: { $ne: 'cancelled' },
        });
        return {
          ...doc,
          tokensBookedToday,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: doctorsWithTokenCounts.length,
      doctors: doctorsWithTokenCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('department', 'name');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get doctor's today queue
// @route   GET /api/doctors/queue/today
// @access  Private (Doctor only)
exports.getTodayQueue = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const tokens = await Token.find({
      doctorId: doctor._id,
      date: { $gte: today },
    }).populate('patientId', 'name email phone');

    res.status(200).json({
      success: true,
      count: tokens.length,
      tokens,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Call next patient
// @route   PUT /api/doctors/call-patient
// @access  Private (Doctor only)
exports.callNextPatient = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find next waiting token
    const token = await Token.findOne({
      doctorId: doctor._id,
      status: 'waiting',
      date: { $gte: today },
    }).sort({ queuePosition: 1 });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'No waiting patients in queue',
      });
    }

    // Update token status
    token.status = 'called';
    token.calledAt = new Date();
    await token.save();

    // Update queue positions
    await Token.updateMany(
      {
        doctorId: doctor._id,
        queuePosition: { $gt: token.queuePosition },
        status: 'waiting',
        date: { $gte: today },
      },
      { $inc: { queuePosition: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Patient called successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Complete consultation
// @route   PUT /api/doctors/complete-consultation/:tokenId
// @access  Private (Doctor only)
exports.completeConsultation = async (req, res, next) => {
  try {
    const { notes, duration } = req.body;

    const token = await Token.findById(req.params.tokenId);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    if (token.doctorUserId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this consultation',
      });
    }

    token.status = 'completed';
    token.completedAt = new Date();
    token.notes = notes || token.notes;
    await token.save();

    // Increment doctor's total consultations
    doctor.totalConsultations = (doctor.totalConsultations || 0) + 1;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Consultation completed successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// @desc    Get doctor stats
// @route   GET /api/doctors/stats
// @access  Private (Doctor only)
exports.getDoctorStats = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      isAvailableToday: doctor.isAvailableToday,
      dailyTokenLimit: doctor.dailyTokenLimit,
      totalConsultations: doctor.totalConsultations,
      rating: doctor.rating,
      totalRatings: doctor.totalRatings,
      reviews: doctor.reviews,
      todayConsultations: await Token.countDocuments({
        doctorId: doctor._id,
        status: 'completed',
        date: { $gte: today },
      }),
      waitingPatients: await Token.countDocuments({
        doctorId: doctor._id,
        status: 'waiting',
        date: { $gte: today },
      }),
      calledPatients: await Token.countDocuments({
        doctorId: doctor._id,
        status: 'called',
        date: { $gte: today },
      }),
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

// @desc    Update doctor availability and token limit
// @route   PUT /api/doctors/availability
// @access  Private (Doctor only)
exports.updateAvailability = async (req, res, next) => {
  try {
    const { isAvailableToday, dailyTokenLimit } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    if (typeof isAvailableToday !== 'undefined') doctor.isAvailableToday = isAvailableToday;
    if (typeof dailyTokenLimit !== 'undefined') doctor.dailyTokenLimit = dailyTokenLimit;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      doctor: {
        isAvailableToday: doctor.isAvailableToday,
        dailyTokenLimit: doctor.dailyTokenLimit,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

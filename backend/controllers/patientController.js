const Token = require('../models/Token');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Book token/queue
// @route   POST /api/patients/book-token
// @access  Private (Patient only)
exports.bookToken = async (req, res, next) => {
  try {
    const { doctorId } = req.body;
    const patientId = req.user.id;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required',
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    if (doctor.isAvailableToday === false) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available today',
      });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check doctor's daily token limit
    const tokensTodayCount = await Token.countDocuments({
      doctorId,
      date: { $gte: today },
      status: { $ne: 'cancelled' },
    });

    if (tokensTodayCount >= (doctor.dailyTokenLimit || 10)) {
      return res.status(400).json({
        success: false,
        message: 'Doctor token limit reached for today',
      });
    }

    // Check if patient already has a token for this doctor today
    const existingToken = await Token.findOne({
      patientId,
      doctorId,
      date: { $gte: today },
      status: { $ne: 'cancelled' },
    });

    if (existingToken) {
      return res.status(400).json({
        success: false,
        message: 'You already have a token for this doctor today',
      });
    }

    // Get the highest token number for today
    const lastToken = await Token.findOne({
      doctorId,
      date: { $gte: today },
    }).sort({ tokenNumber: -1 });

    const tokenNumber = (lastToken?.tokenNumber || 0) + 1;

    // Get queue position
    const queuePosition = (lastToken?.queuePosition || 0) + 1;

    // Create token
    const token = await Token.create({
      doctorId,
      doctorUserId: doctor.userId,
      patientId,
      patientName: req.user.name,
      tokenNumber,
      queuePosition,
      date: today,
    });

    // Fetch doctor with populated department name
    const populatedDoctor = await Doctor.findById(doctorId).populate('department', 'name');

    res.status(201).json({
      success: true,
      message: 'Token booked successfully',
      token: {
        _id: token._id,
        tokenNumber: token.tokenNumber,
        queuePosition: token.queuePosition,
        status: token.status,
        doctorId: {
          _id: doctor._id,
          name: doctor.name,
          department: populatedDoctor?.department || doctor.department,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get patient's current token
// @route   GET /api/patients/my-token
// @access  Private (Patient only)
exports.getMyToken = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const token = await Token.findOne({
      patientId,
      date: { $gte: today },
      status: { $ne: 'cancelled' },
    }).populate({
      path: 'doctorId',
      select: 'name department',
      populate: {
        path: 'department',
        select: 'name',
      },
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'No active token found',
      });
    }

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get patient's queue position and wait time
// @route   GET /api/patients/queue-status/:tokenId
// @access  Private (Patient only)
exports.getQueueStatus = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.tokenId).populate('doctorId', 'name');

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    if (token.patientId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get completed count to estimate wait time (5 min per consultation)
    const completedCount = await Token.countDocuments({
      doctorId: token.doctorId,
      status: 'completed',
      date: { $gte: today },
    });

    const estimatedWaitTime = token.queuePosition * 15; // Approximate 15 min per token

    res.status(200).json({
      success: true,
      queueStatus: {
        tokenNumber: token.tokenNumber,
        queuePosition: token.queuePosition,
        status: token.status,
        estimatedWaitTime,
        doctor: token.doctorId.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel token
// @route   PUT /api/patients/cancel-token/:tokenId
// @access  Private (Patient only)
exports.cancelToken = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.tokenId);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    if (token.patientId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (token.status === 'completed' || token.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${token.status} token`,
      });
    }

    token.status = 'cancelled';
    await token.save();

    // Update queue positions for remaining tokens
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Token.updateMany(
      {
        doctorId: token.doctorId,
        queuePosition: { $gt: token.queuePosition },
        status: 'waiting',
        date: { $gte: today },
      },
      { $inc: { queuePosition: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Token cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add review and rating for a doctor
// @route   POST /api/patients/add-review
// @access  Private (Patient only)
exports.addReview = async (req, res) => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, Appointment ID, and rating are required',
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.isReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this appointment',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const newReview = {
      patientId,
      appointmentId,
      patientName: req.user.name,
      rating: Number(rating),
      comment: comment || '',
    };

    doctor.reviews.push(newReview);

    // Update overall rating
    const totalCurrentScore = doctor.rating * doctor.totalRatings;
    doctor.totalRatings += 1;
    const newRating = (totalCurrentScore + Number(rating)) / doctor.totalRatings;
    doctor.rating = Math.round(newRating * 10) / 10;

    await doctor.save();

    // Mark appointment as reviewed
    appointment.isReviewed = true;
    appointment.rating = Number(rating);
    appointment.feedback = comment || '';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Review added successfully',
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

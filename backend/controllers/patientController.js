const Token = require('../models/Token');
const Doctor = require('../models/Doctor');

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

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    res.status(201).json({
      success: true,
      message: 'Token booked successfully',
      token: {
        _id: token._id,
        tokenNumber: token.tokenNumber,
        queuePosition: token.queuePosition,
        status: token.status,
        doctor: {
          name: doctor.name,
          department: doctor.department,
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
    }).populate('doctorId', 'name department');

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

const Token = require('../models/Token');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Generate a manual queue token (Admin booking on behalf of patient)
// @route   POST /api/admin/queues/generate-token
// @access  Private (Admin only)
exports.generateManualToken = async (req, res) => {
  try {
    const { patientId, doctorId } = req.body;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and Doctor ID are required',
      });
    }

    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if patient already has a token for this doctor today
    const existingToken = await Token.findOne({
      patientId,
      doctorId,
      date: { $gte: today },
      status: { $nin: ['cancelled', 'completed', 'skipped'] },
    });

    if (existingToken) {
      return res.status(400).json({
        success: false,
        message: 'Patient already has an active token for this doctor today',
      });
    }

    const lastToken = await Token.findOne({
      doctorId,
      date: { $gte: today },
    }).sort({ tokenNumber: -1 });

    const tokenNumber = (lastToken?.tokenNumber || 0) + 1;
    const queuePosition = (lastToken?.queuePosition || 0) + 1;

    const token = await Token.create({
      doctorId,
      doctorUserId: doctor.userId,
      patientId,
      patientName: patient.name,
      tokenNumber,
      queuePosition,
      date: today,
      status: 'waiting',
    });

    const populatedToken = await Token.findById(token._id).populate('doctorId', 'name department');

    res.status(201).json({
      success: true,
      message: 'Token generated successfully',
      token: populatedToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Call next patient in queue
// @route   PUT /api/admin/queues/call-patient
// @access  Private (Admin only)
exports.callPatient = async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find next waiting token
    const token = await Token.findOne({
      doctorId,
      status: 'waiting',
      date: { $gte: today },
    }).sort({ queuePosition: 1 });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'No patients waiting in the queue',
      });
    }

    token.status = 'called';
    token.calledAt = new Date();
    await token.save();

    // Decrement queue position for subsequent waiting tokens
    await Token.updateMany(
      {
        doctorId,
        queuePosition: { $gt: token.queuePosition },
        status: 'waiting',
        date: { $gte: today },
      },
      { $inc: { queuePosition: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Next patient called successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Start consultation (transition called patient to in-consultation)
// @route   PUT /api/admin/queues/start-consultation/:tokenId
// @access  Private (Admin only)
exports.startConsultation = async (req, res) => {
  try {
    const token = await Token.findById(req.params.tokenId);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    if (token.status !== 'called') {
      return res.status(400).json({
        success: false,
        message: 'Consultation can only be started for called patients',
      });
    }

    token.status = 'in-consultation';
    await token.save();

    res.status(200).json({
      success: true,
      message: 'Consultation started successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Skip patient
// @route   PUT /api/admin/queues/skip-patient/:tokenId
// @access  Private (Admin only)
exports.skipPatient = async (req, res) => {
  try {
    const token = await Token.findById(req.params.tokenId);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    if (token.status !== 'waiting' && token.status !== 'called') {
      return res.status(400).json({
        success: false,
        message: 'Can only skip waiting or called patients',
      });
    }

    const previousPosition = token.queuePosition;
    token.status = 'skipped';
    token.skippedAt = new Date();
    token.queuePosition = 0; // Out of active queue positions
    await token.save();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update remaining waiting tokens
    if (previousPosition > 0) {
      await Token.updateMany(
        {
          doctorId: token.doctorId,
          queuePosition: { $gt: previousPosition },
          status: 'waiting',
          date: { $gte: today },
        },
        { $inc: { queuePosition: -1 } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Patient skipped successfully',
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
// @route   PUT /api/admin/queues/complete-consultation/:tokenId
// @access  Private (Admin only)
exports.completeConsultation = async (req, res) => {
  try {
    const { notes } = req.body;
    const token = await Token.findById(req.params.tokenId);

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    if (token.status !== 'in-consultation' && token.status !== 'called') {
      return res.status(400).json({
        success: false,
        message: 'Consultation can only be completed from in-consultation or called states',
      });
    }

    token.status = 'completed';
    token.completedAt = new Date();
    if (notes) token.notes = notes;
    await token.save();

    // Increment doctor's total consultations
    await Doctor.findByIdAndUpdate(token.doctorId, {
      $inc: { totalConsultations: 1 },
    });

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

// @desc    Reset today's queue for a doctor
// @route   PUT /api/admin/queues/reset-queue
// @access  Private (Admin only)
exports.resetQueue = async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Cancel all active tokens for today
    await Token.updateMany(
      {
        doctorId,
        date: { $gte: today },
        status: { $in: ['waiting', 'called', 'in-consultation', 'skipped'] },
      },
      {
        $set: { status: 'cancelled', queuePosition: 0 },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Queue reset successfully for today',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

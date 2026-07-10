const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Token = require('../models/Token');

// @desc    Book a future appointment
// @route   POST /api/patients/appointments
// @access  Private (Patient only)
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, symptoms } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, appointmentDate, and timeSlot',
      });
    }

    const doctor = await Doctor.findById(doctorId).populate('userId');
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Check if slot already booked for this doctor on this day
    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['pending', 'approved'] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for the selected date',
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      doctorUserId: doctor.userId._id,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      symptoms: symptoms || '',
      consultationFee: doctor.consultationFee || 500,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully and is pending approval',
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get patient's own appointments
// @route   GET /api/patients/appointments
// @access  Private (Patient only)
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate({
        path: 'doctorId',
        select: 'name department qualifications',
        populate: { path: 'department', select: 'name' }
      })
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel an appointment (Patient)
// @route   PUT /api/patients/appointments/:id/cancel
// @access  Private (Patient only)
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, patientId: req.user.id });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${appointment.status} appointment`,
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reschedule an appointment (Patient)
// @route   PUT /api/patients/appointments/:id/reschedule
// @access  Private (Patient only)
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentDate, timeSlot } = req.body;

    if (!appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide appointmentDate and timeSlot',
      });
    }

    const appointment = await Appointment.findOne({ _id: req.params.id, patientId: req.user.id });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a ${appointment.status} appointment`,
      });
    }

    // Check if new slot already booked
    const existing = await Appointment.findOne({
      doctorId: appointment.doctorId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['pending', 'approved'] },
      _id: { $ne: appointment._id },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for the selected date',
      });
    }

    appointment.appointmentDate = new Date(appointmentDate);
    appointment.timeSlot = timeSlot;
    appointment.status = 'pending'; // Reset to pending approval
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully; pending approval',
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/admin/appointments
// @access  Private (Admin only)
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, doctorId, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (doctorId) filter.doctorId = doctorId;
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.appointmentDate = { $gte: searchDate, $lt: nextDay };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email phone')
      .populate({
        path: 'doctorId',
        select: 'name department',
        populate: { path: 'department', select: 'name' }
      })
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve an appointment (Admin)
// @route   PUT /api/admin/appointments/:id/approve
// @access  Private (Admin only)
exports.approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patientId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Appointment is already ${appointment.status}`,
      });
    }

    appointment.status = 'approved';
    await appointment.save();

    // IF APPROVED FOR TODAY: Auto-create a Queue Token
    const appointmentDate = new Date(appointment.appointmentDate);
    appointmentDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let token = null;
    if (appointmentDate.getTime() === today.getTime()) {
      // Get the highest token number for today
      const lastToken = await Token.findOne({
        doctorId: appointment.doctorId,
        date: { $gte: today },
      }).sort({ tokenNumber: -1 });

      const tokenNumber = (lastToken?.tokenNumber || 0) + 1;
      const queuePosition = (lastToken?.queuePosition || 0) + 1;

      token = await Token.create({
        doctorId: appointment.doctorId,
        doctorUserId: appointment.doctorUserId,
        patientId: appointment.patientId._id,
        patientName: appointment.patientId.name,
        tokenNumber,
        queuePosition,
        date: today,
        status: 'waiting',
      });

      // Populate doctor for response consistency
      token = await Token.findById(token._id).populate('doctorId', 'name department');
    }

    res.status(200).json({
      success: true,
      message: token 
        ? 'Appointment approved and queue token auto-generated successfully' 
        : 'Appointment approved successfully',
      appointment,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject an appointment (Admin)
// @route   PUT /api/admin/appointments/:id/reject
// @access  Private (Admin only)
exports.rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Appointment is already ${appointment.status}`,
      });
    }

    appointment.status = 'rejected';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rejected successfully',
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get doctor's own appointments
// @route   GET /api/appointments/doctor
// @access  Private (Doctor only)
exports.getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    const { status, date } = req.query;
    const filter = { doctorId: doctor._id };
    if (status) filter.status = status;
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.appointmentDate = { $gte: searchDate, $lt: nextDay };
    }
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email phone age gender bloodGroup')
      .populate({ path: 'doctorId', select: 'name department', populate: { path: 'department', select: 'name' } })
      .sort({ appointmentDate: 1, timeSlot: 1 });
    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Doctor marks appointment as completed
// @route   PUT /api/appointments/doctor/:id/complete
// @access  Private (Doctor only)
exports.doctorCompleteAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    const appointment = await Appointment.findOne({ _id: req.params.id, doctorId: doctor._id });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot complete a ${appointment.status} appointment` });
    }
    appointment.status = 'completed';
    if (req.body.notes) appointment.notes = req.body.notes;
    await appointment.save();
    res.status(200).json({ success: true, message: 'Appointment marked as completed', appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

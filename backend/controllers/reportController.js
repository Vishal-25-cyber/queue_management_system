const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Token = require('../models/Token');
const Appointment = require('../models/Appointment');

// @desc    Get Patient Report Data
// @route   GET /api/admin/reports/patients
// @access  Private (Admin only)
exports.getPatientReport = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).sort({ createdAt: -1 });

    const reportData = await Promise.all(
      patients.map(async patient => {
        const appointmentCount = await Appointment.countDocuments({ patientId: patient._id });
        const tokenCount = await Token.countDocuments({ patientId: patient._id });

        return {
          Name: patient.name,
          Email: patient.email,
          Phone: patient.phone || '—',
          Age: patient.age || '—',
          Gender: patient.gender || '—',
          Status: patient.isActive ? 'Active' : 'Inactive',
          RegisteredDate: patient.createdAt.toLocaleDateString('en-IN'),
          TotalAppointments: appointmentCount,
          TotalTokens: tokenCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      reportData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Appointment Report Data
// @route   GET /api/admin/reports/appointments
// @access  Private (Admin only)
exports.getAppointmentReport = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name department')
      .sort({ appointmentDate: -1 });

    const reportData = appointments.map(app => ({
      PatientName: app.patientId?.name || 'Unknown Patient',
      PatientEmail: app.patientId?.email || '—',
      PatientPhone: app.patientId?.phone || '—',
      DoctorName: app.doctorId?.name || 'Unknown Doctor',
      Department: app.doctorId?.department?.name || app.doctorId?.department || '—',
      AppointmentDate: new Date(app.appointmentDate).toLocaleDateString('en-IN'),
      TimeSlot: app.timeSlot,
      Status: app.status.toUpperCase(),
      Fee: app.consultationFee,
      Payment: app.paymentStatus.toUpperCase(),
    }));

    res.status(200).json({
      success: true,
      reportData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Queue Report Data
// @route   GET /api/admin/reports/queues
// @access  Private (Admin only)
exports.getQueueReport = async (req, res) => {
  try {
    const tokens = await Token.find({})
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name department')
      .sort({ date: -1, tokenNumber: 1 });

    const reportData = tokens.map(tok => {
      let waitTime = 0;
      if (tok.calledAt && tok.bookedAt) {
        waitTime = Math.round((new Date(tok.calledAt) - new Date(tok.bookedAt)) / 60000); // Wait time in mins
      }

      return {
        TokenNumber: tok.tokenNumber,
        PatientName: tok.patientName || tok.patientId?.name || 'Unknown',
        DoctorName: tok.doctorId?.name || 'Unknown Doctor',
        Department: tok.doctorId?.department?.name || tok.doctorId?.department || '—',
        Date: new Date(tok.date).toLocaleDateString('en-IN'),
        Status: tok.status.toUpperCase(),
        BookedAt: new Date(tok.bookedAt).toLocaleTimeString('en-IN'),
        CalledAt: tok.calledAt ? new Date(tok.calledAt).toLocaleTimeString('en-IN') : '—',
        CompletedAt: tok.completedAt ? new Date(tok.completedAt).toLocaleTimeString('en-IN') : '—',
        WaitingTimeMinutes: waitTime > 0 ? waitTime : 0,
      };
    });

    res.status(200).json({
      success: true,
      reportData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Doctor Report Data
// @route   GET /api/admin/reports/doctors
// @access  Private (Admin only)
exports.getDoctorReport = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).populate('userId', 'email phone');

    const reportData = doctors.map(doc => ({
      Name: doc.name,
      Department: doc.department?.name || doc.department || '—',
      Qualifications: doc.qualifications,
      ExperienceYears: doc.experience,
      Fee: doc.consultationFee,
      ConsultationsCompleted: doc.totalConsultations,
      Rating: doc.rating,
      Status: doc.isActive ? 'Active' : 'Inactive',
      Email: doc.userId?.email || '—',
      Phone: doc.userId?.phone || '—',
    }));

    res.status(200).json({
      success: true,
      reportData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    doctorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'called', 'in-consultation', 'completed', 'cancelled', 'skipped'],
      default: 'waiting',
    },
    queuePosition: {
      type: Number,
      required: true,
    },
    estimatedWaitTime: {
      type: Number,
      default: 0,
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    skippedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Token', tokenSchema);

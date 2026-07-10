const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

require('dotenv').config();

const connectDB = require('./config/database');
const initializeSocket = require('./socket/socketHandler');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const adminRoutes = require('./routes/adminRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const adminQueueRoutes = require('./routes/adminQueueRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');

const { PORT, FRONTEND_URL } = require('./config/env');

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB
connectDB().then(() => {
  const runMigration = require('./config/migration');
  runMigration();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: FRONTEND_URL }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin/queues', adminQueueRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/reports', reportRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  });
});

// Socket.IO initialization
initializeSocket(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🏥 Hospital Queue Management System - Backend Server');
  console.log('='.repeat(60));
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`📊 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  console.log(`🔐 JWT Configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
  console.log('\n' + '='.repeat(60));
  console.log('📚 Available Endpoints:');
  console.log('  GET  /api/health - Health check');
  console.log('  POST /api/auth/register - Register');
  console.log('  POST /api/auth/login - Login');
  console.log('  GET  /api/doctors - Get all doctors');
  console.log('  POST /api/patients/book-token - Book queue');
  console.log('  GET  /api/admin/dashboard - Admin stats');
  console.log('='.repeat(60) + '\n');
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server Error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⛔ Server shutting down...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

module.exports = server;

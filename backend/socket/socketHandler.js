const Token = require('../models/Token');
const Notification = require('../models/Notification');

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Join Doctor Queue room
    socket.on('join_queue', (data) => {
      const { doctorId, userId, userRole } = data;
      const roomName = `doctor_${doctorId}`;

      socket.join(roomName);
      console.log(`User ${userId} (${userRole}) joined room ${roomName}`);

      socket.to(roomName).emit('user_joined', {
        userId,
        userRole,
        timestamp: new Date(),
      });
    });

    // Join Patient Notification room
    socket.on('join_user', (data) => {
      const { userId } = data;
      const roomName = `user_${userId}`;

      socket.join(roomName);
      console.log(`User ${userId} joined notification room ${roomName}`);
    });

    // Broadcast a custom notification to a specific user
    socket.on('send_notification', async (data) => {
      try {
        const { userId, title, message, type } = data;
        
        // Save to DB
        const notification = await Notification.create({
          userId,
          title,
          message,
          type: type || 'info',
        });

        // Emit in real-time to that specific user
        io.to(`user_${userId}`).emit('new_notification', {
          notification,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error sending notification via socket:', error);
      }
    });

    // Patient books token
    socket.on('token_booked', async (data) => {
      try {
        const { doctorId, tokenId, tokenNumber, queuePosition } = data;
        const roomName = `doctor_${doctorId}`;

        io.to(roomName).emit('queue_updated', {
          type: 'token_booked',
          doctorId,
          tokenId,
          tokenNumber,
          queuePosition,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error in token_booked:', error);
      }
    });

    // Call patient
    socket.on('call_next_patient', async (data) => {
      try {
        const { doctorId, tokenId, tokenNumber } = data;
        const roomName = `doctor_${doctorId}`;

        io.to(roomName).emit('patient_called', {
          doctorId,
          tokenId,
          tokenNumber,
          status: 'called',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error in call_next_patient:', error);
      }
    });

    // Start Consultation
    socket.on('start_consultation', async (data) => {
      try {
        const { doctorId, tokenId, tokenNumber } = data;
        const roomName = `doctor_${doctorId}`;

        io.to(roomName).emit('consultation_started', {
          doctorId,
          tokenId,
          tokenNumber,
          status: 'in-consultation',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error in start_consultation:', error);
      }
    });

    // Skip Patient
    socket.on('skip_patient', async (data) => {
      try {
        const { doctorId, tokenId, tokenNumber, queuePosition } = data;
        const roomName = `doctor_${doctorId}`;

        io.to(roomName).emit('patient_skipped', {
          doctorId,
          tokenId,
          tokenNumber,
          status: 'skipped',
          timestamp: new Date(),
        });

        // Trigger queue positions updated
        io.to(roomName).emit('queue_positions_updated', {
          doctorId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error in skip_patient:', error);
      }
    });

    // Complete Consultation
    socket.on('consultation_completed', async (data) => {
      try {
        const { doctorId, tokenId, tokenNumber } = data;
        const roomName = `doctor_${doctorId}`;

        io.to(roomName).emit('consultation_ended', {
          doctorId,
          tokenId,
          tokenNumber,
          status: 'completed',
          timestamp: new Date(),
        });

        // Trigger queue positions updated
        io.to(roomName).emit('queue_positions_updated', {
          doctorId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error in consultation_completed:', error);
      }
    });

    // Patient cancels token
    socket.on('token_cancelled', async (data) => {
      try {
        const { doctorId, tokenId, queuePosition } = data;
        const roomName = `doctor_${doctorId}`;

        io.to(roomName).emit('queue_updated', {
          type: 'token_cancelled',
          doctorId,
          tokenId,
          queuePosition,
          timestamp: new Date(),
        });

        // Trigger queue positions updated
        io.to(roomName).emit('queue_positions_updated', {
          doctorId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error in token_cancelled:', error);
      }
    });

    // Reset doctor queue
    socket.on('reset_queue', (data) => {
      const { doctorId } = data;
      const roomName = `doctor_${doctorId}`;

      io.to(roomName).emit('queue_reset', {
        doctorId,
        timestamp: new Date(),
      });
    });

    // Doctor status updates
    socket.on('doctor_online', (data) => {
      const { doctorId } = data;
      const roomName = `doctor_${doctorId}`;

      socket.join(roomName);
      io.to(roomName).emit('doctor_status_changed', {
        doctorId,
        status: 'online',
        timestamp: new Date(),
      });
    });

    socket.on('doctor_offline', (data) => {
      const { doctorId } = data;
      const roomName = `doctor_${doctorId}`;

      io.to(roomName).emit('doctor_status_changed', {
        doctorId,
        status: 'offline',
        timestamp: new Date(),
      });

      socket.leave(roomName);
    });

    // Get queue status
    socket.on('get_queue_status', async (data) => {
      try {
        const { doctorId } = data;
        const roomName = `doctor_${doctorId}`;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const queueTokens = await Token.find({
          doctorId,
          date: { $gte: today },
          status: { $in: ['waiting', 'called', 'in-consultation'] },
        }).sort({ queuePosition: 1 });

        socket.emit('queue_status', {
          doctorId,
          queue: queueTokens,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error in get_queue_status:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initializeSocket;

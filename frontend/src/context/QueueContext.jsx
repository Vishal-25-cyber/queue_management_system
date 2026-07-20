import React, { createContext, useState, useContext, useEffect } from 'react';
import io from 'socket.io-client';

const QueueContext = createContext();

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) throw new Error('useQueue must be used within QueueProvider');
  return context;
};

// Strip "/api" suffix from VITE_API_URL to get socket base URL
const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://queue-management-system-chxh.onrender.com/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

export const QueueProvider = ({ children }) => {
  const [socket, setSocket]           = useState(null);
  const [queueData, setQueueData]     = useState(null);
  const [doctorStatus, setDoctorStatus] = useState({});
  const [connected, setConnected]     = useState(false);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('queue_updated', (data) => setQueueData(data));
    newSocket.on('patient_called', (data) => setQueueData(data));
    newSocket.on('consultation_started', (data) => setQueueData(data));
    newSocket.on('patient_skipped', (data) => setQueueData(data));
    newSocket.on('consultation_ended', (data) => setQueueData(data));
    newSocket.on('queue_reset', (data) => setQueueData(data));
    newSocket.on('doctor_status_changed', (data) => {
      setDoctorStatus(prev => ({ ...prev, [data.doctorId]: data.status }));
    });

    setSocket(newSocket);

    return () => { newSocket.disconnect(); };
  }, []);

  const joinQueue = (doctorId, userId, userRole) => {
    if (socket?.connected) socket.emit('join_queue', { doctorId, userId, userRole });
  };

  const bookToken = (data) => {
    if (socket?.connected) socket.emit('token_booked', data);
  };

  const callNextPatient = (data) => {
    if (socket?.connected) socket.emit('call_next_patient', data);
  };

  const startConsultation = (data) => {
    if (socket?.connected) socket.emit('start_consultation', data);
  };

  const skipPatient = (data) => {
    if (socket?.connected) socket.emit('skip_patient', data);
  };

  const completeConsultation = (data) => {
    if (socket?.connected) socket.emit('consultation_completed', data);
  };

  const cancelToken = (data) => {
    if (socket?.connected) socket.emit('token_cancelled', data);
  };

  const resetQueue = (data) => {
    if (socket?.connected) socket.emit('reset_queue', data);
  };

  const doctorOnline = (doctorId) => {
    if (socket?.connected) socket.emit('doctor_online', { doctorId });
  };

  const doctorOffline = (doctorId) => {
    if (socket?.connected) socket.emit('doctor_offline', { doctorId });
  };

  const getQueueStatus = (doctorId) => {
    if (socket?.connected) socket.emit('get_queue_status', { doctorId });
  };

  return (
    <QueueContext.Provider
      value={{
        socket,
        connected,
        queueData,
        doctorStatus,
        joinQueue,
        bookToken,
        callNextPatient,
        startConsultation,
        skipPatient,
        completeConsultation,
        cancelToken,
        resetQueue,
        doctorOnline,
        doctorOffline,
        getQueueStatus,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Service
export const authService = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

// Department Service
export const departmentService = {
  getAllDepartments: (activeOnly = false) => 
    apiClient.get('/departments', { params: { activeOnly } }),
  getDepartmentStats: () => apiClient.get('/departments/stats'),
  addDepartment: (data) => apiClient.post('/departments', data),
  updateDepartment: (id, data) => apiClient.put(`/departments/${id}`, data),
  deleteDepartment: (id) => apiClient.delete(`/departments/${id}`),
};

// Doctor Service
export const doctorService = {
  getAllDoctors: () => apiClient.get('/doctors'),
  getDoctorById: (id) => apiClient.get(`/doctors/${id}`),
  getTodayQueue: () => apiClient.get('/doctors/queue/today'),
  callNextPatient: () => apiClient.put('/doctors/call-patient'),
  completeConsultation: (tokenId, data) =>
    apiClient.put(`/doctors/complete-consultation/${tokenId}`, data),
  getDoctorStats: () => apiClient.get('/doctors/stats'),
};

// Patient Service
export const patientService = {
  bookToken: (doctorId) => apiClient.post('/patients/book-token', { doctorId }),
  getMyToken: () => apiClient.get('/patients/my-token'),
  getQueueStatus: (tokenId) => apiClient.get(`/patients/queue-status/${tokenId}`),
  cancelToken: (tokenId) => apiClient.put(`/patients/cancel-token/${tokenId}`),
};

// Appointment Service
export const appointmentService = {
  bookAppointment: (data) => apiClient.post('/appointments', data),
  getMyAppointments: () => apiClient.get('/appointments'),
  cancelAppointment: (id) => apiClient.put(`/appointments/${id}/cancel`),
  rescheduleAppointment: (id, data) => apiClient.put(`/appointments/${id}/reschedule`, data),
  adminGetAllAppointments: (params) => apiClient.get('/appointments/admin', { params }),
  adminApproveAppointment: (id) => apiClient.put(`/appointments/admin/${id}/approve`),
  adminRejectAppointment: (id) => apiClient.put(`/appointments/admin/${id}/reject`),
  // Doctor-facing
  getDoctorAppointments: (params) => apiClient.get('/appointments/doctor', { params }),
  doctorAcceptAppointment: (id) => apiClient.put(`/appointments/doctor/${id}/accept`),
  doctorRejectAppointment: (id, data) => apiClient.put(`/appointments/doctor/${id}/reject`, data),
  doctorCompleteAppointment: (id, data) => apiClient.put(`/appointments/doctor/${id}/complete`, data),
};

// Admin Queue Management Service
export const adminQueueService = {
  generateManualToken: (patientId, doctorId) => 
    apiClient.post('/admin/queues/generate-token', { patientId, doctorId }),
  callPatient: (doctorId) => apiClient.put('/admin/queues/call-patient', { doctorId }),
  startConsultation: (tokenId) => apiClient.put(`/admin/queues/start-consultation/${tokenId}`),
  skipPatient: (tokenId) => apiClient.put(`/admin/queues/skip-patient/${tokenId}`),
  completeConsultation: (tokenId, notes) => 
    apiClient.put(`/admin/queues/complete-consultation/${tokenId}`, { notes }),
  resetQueue: (doctorId) => apiClient.put('/admin/queues/reset-queue', { doctorId }),
};

// Notification Service
export const notificationService = {
  getMyNotifications: () => apiClient.get('/notifications'),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllRead: () => apiClient.put('/notifications/read-all'),
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
};

// Reports Service
export const reportService = {
  getPatientReport: () => apiClient.get('/admin/reports/patients'),
  getAppointmentReport: () => apiClient.get('/admin/reports/appointments'),
  getQueueReport: () => apiClient.get('/admin/reports/queues'),
  getDoctorReport: () => apiClient.get('/admin/reports/doctors'),
};

// Admin Service
export const adminService = {
  addDoctor: (doctorData) => apiClient.post('/admin/doctors', doctorData),
  updateDoctor: (id, data) => apiClient.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id) => apiClient.delete(`/admin/doctors/${id}`),
  getAllPatients: (params) => apiClient.get('/admin/patients', { params }),
  addPatient: (data) => apiClient.post('/admin/patients', data),
  updatePatient: (id, data) => apiClient.put(`/admin/patients/${id}`, data),
  deletePatient: (id) => apiClient.delete(`/admin/patients/${id}`),
  getPatientProfile: (id) => apiClient.get(`/admin/patients/${id}`),
  getAllAppointments: () => apiClient.get('/admin/appointments'),
  getDashboardStats: () => apiClient.get('/admin/dashboard'),
  getQueueStatus: () => apiClient.get('/admin/queue-status'),
};

export default apiClient;

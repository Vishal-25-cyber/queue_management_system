import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import PatientProfile from '../components/PatientProfile';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminService } from '../services/api';

// Subcomponents
import AdminDashboardOverview from '../components/AdminDashboardOverview';
import AdminQueueManagement from '../components/AdminQueueManagement';
import AdminPatientManagement from '../components/AdminPatientManagement';
import AdminDoctorManagement from '../components/AdminDoctorManagement';
import AdminDepartmentManagement from '../components/AdminDepartmentManagement';
import AdminAppointmentManagement from '../components/AdminAppointmentManagement';
import AdminAnalytics from '../components/AdminAnalytics';
import AdminReports from '../components/AdminReports';

import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [sRes, qRes] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getQueueStatus(),
      ]);
      setStats(sRes.data.stats);
      setQueueData(qRes.data.queueData || []);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to load dashboard data.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
        <LoadingSpinner message="Loading hospital management dashboard…" />
      </div>
    );
  }

  return (
    <div className="app-dashboard-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="patient-content-container">
        <Navbar />
        
        <main className="dashboard-main-content no-sidebar">
          {alert && (
            <div style={{ marginBottom: '1.5rem' }}>
              <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
            </div>
          )}
          
          {activeTab === 'overview' && (
            <AdminDashboardOverview stats={stats} queueData={queueData} setActiveTab={setActiveTab} />
          )}
          
          {activeTab === 'queue' && (
            <AdminQueueManagement queueData={queueData} setAlert={setAlert} fetchAll={fetchAll} />
          )}
          
          {activeTab === 'appointments' && (
            <AdminAppointmentManagement setAlert={setAlert} fetchAll={fetchAll} />
          )}
          
          {activeTab === 'patients' && (
            <AdminPatientManagement setAlert={setAlert} />
          )}
          
          {activeTab === 'doctors' && (
            <AdminDoctorManagement setAlert={setAlert} />
          )}
          
          {activeTab === 'departments' && (
            <AdminDepartmentManagement setAlert={setAlert} />
          )}
          
          {activeTab === 'analytics' && (
            <AdminAnalytics queueData={queueData} />
          )}
          
          {activeTab === 'reports' && (
            <AdminReports setAlert={setAlert} />
          )}

          {activeTab === 'profile' && (
            <PatientProfile setAlert={setAlert} />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

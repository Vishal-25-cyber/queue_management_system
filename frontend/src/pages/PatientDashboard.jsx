import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { doctorService, patientService, departmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Stethoscope, Star, Ticket, History } from 'lucide-react';

// Subcomponents
import PatientAppointments from '../components/PatientAppointments';
import PatientProfile from '../components/PatientProfile';

import '../styles/Dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [selectedDept, setSelectedDept] = useState('all');
  const [search, setSearch] = useState('');

  const [allDepartments, setAllDepartments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const getDeptName = (dept) => {
    if (!dept) return '';
    return typeof dept === 'object' ? (dept.name || '') : dept;
  };

  useEffect(() => {
    let list = doctors;
    if (selectedDept !== 'all') list = list.filter(d => getDeptName(d.department) === selectedDept);
    if (search.trim()) list = list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [doctors, selectedDept, search]);

  const fetchData = async () => {
    try {
      const [docRes, deptRes] = await Promise.all([
        doctorService.getAllDoctors(),
        departmentService.getAllDepartments(true)
      ]);
      setDoctors(docRes.data.doctors || []);
      setAllDepartments(deptRes.data.departments || []);
    } catch {
      setAlert({ type: 'error', message: 'Could not load data. Please refresh.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (doctorId) => {
    setBookingLoading(doctorId);
    try {
      const res = await patientService.bookToken(doctorId);
      const token = res.data.token;
      setAlert({ type: 'success', message: `Token #${token.tokenNumber} booked! You are in queue.` });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Booking failed.' });
    } finally {
      setBookingLoading(null);
    }
  };

  const departmentOptions = ['all', ...allDepartments.map(d => d.name)];

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
        <LoadingSpinner message="Loading hospital information…" />
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

          {/* ── Dashboard Tab ── */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Header */}
              <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
                <h1 className="dashboard-title">Welcome, {user?.name?.split(' ')[0]}</h1>
                <p className="dashboard-subtitle">Find a doctor and book a walk-in token instantly</p>
              </div>

              {/* Search & Filter */}
              <div className="section-header">
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="section-title-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Search size={18} style={{ color: 'white' }} />
                  </div>
                  Find a Doctor
                </h2>
              </div>

              <div className="filter-bar">
                <div className="search-input" style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                  <span className="search-icon" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none', display: 'inline-flex' }}>
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by doctor name…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                <div style={{ minWidth: 200 }}>
                  <select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept === 'all' ? 'All Departments' : dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor Cards */}
              <div className="section-header">
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="section-title-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stethoscope size={18} style={{ color: 'white' }} />
                  </div>
                  Available Doctors ({filteredDoctors.length})
                </h2>
              </div>

              {filteredDoctors.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state-icon" style={{ display: 'inline-flex', justifyContent: 'center' }}>
                    <Search size={48} style={{ color: 'var(--gray-300)' }} />
                  </span>
                  <div className="empty-state-title">No doctors found</div>
                  <p className="empty-state-text">Try adjusting your search filters.</p>
                </div>
              ) : (
                <div className="doctors-grid">
                  {filteredDoctors.map(doctor => (
                    <div key={doctor._id} className="doctor-card">
                      <div className="doctor-card-header">
                        <div className="doctor-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Stethoscope size={24} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                          <div className="doctor-card-name">{doctor.name}</div>
                          <span className="doctor-card-dept">{doctor.department?.name || doctor.department}</span>
                        </div>
                      </div>

                      <div className="doctor-card-details">
                        <div className="doctor-detail-item">
                          <span className="doctor-detail-label">Experience</span>
                          <span className="doctor-detail-value">{doctor.experience} yrs</span>
                        </div>
                        <div className="doctor-detail-item">
                          <span className="doctor-detail-label">Rating</span>
                          <span className="doctor-detail-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Star size={14} fill="#eab308" color="#eab308" /> {doctor.rating?.toFixed(1) || '4.5'} 
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>({doctor.reviews?.length || 0})</span>
                          </span>
                        </div>
                        <div className="doctor-detail-item">
                          <span className="doctor-detail-label">Fee</span>
                          <span className="doctor-detail-value">₹{doctor.consultationFee}</span>
                        </div>
                        <div className="doctor-detail-item">
                          <span className="doctor-detail-label">Qualification</span>
                          <span className="doctor-detail-value" style={{ fontSize: '0.8rem' }}>{doctor.qualifications}</span>
                        </div>
                      </div>

                      {doctor.bio && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.5 }}>
                          {doctor.bio}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Book Appointment Tab ── */}
          {activeTab === 'book' && (
            <PatientAppointments setAlert={setAlert} />
          )}

          {/* ── History / Past logs ── */}
          {activeTab === 'history' && (
            <div className="dashboard-sub-card">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                <History size={20} style={{ color: 'var(--primary)' }} /> Consultation Check-in History
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>Full record of your pending and completed appointments</p>
              <PatientAppointments setAlert={setAlert} showBooking={false} historyMode={true} />
            </div>
          )}

          {/* ── Profile settings Tab ── */}
          {activeTab === 'profile' && (
            <PatientProfile setAlert={setAlert} />
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;

import React, { useState, useEffect } from 'react';
import { appointmentService, doctorService } from '../services/api';
import {
  Calendar, Clock, X, Edit3, Stethoscope,
  ChevronDown, CheckCircle, AlertCircle, XCircle,
  Loader2, CalendarPlus, ClipboardList, RotateCcw,
  User, Banknote, Award, Info, Bell
} from 'lucide-react';
import '../styles/Dashboard.css';
import '../styles/PatientAppointments.css';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

const STATUS_CONFIG = {
  pending:   { icon: AlertCircle,   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)',   label: 'Pending' },
  approved:  { icon: CheckCircle,   color: '#10b981', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.25)',   label: 'Approved' },
  rejected:  { icon: XCircle,       color: '#ef4444', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.25)',    label: 'Rejected' },
  cancelled: { icon: XCircle,       color: '#64748b', bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.25)', label: 'Cancelled' },
  completed: { icon: CheckCircle,   color: '#7c3aed', bg: 'rgba(124,58,237,0.1)',   border: 'rgba(124,58,237,0.25)',  label: 'Completed' },
};

const PatientAppointments = ({ setAlert, showBooking = true, historyMode = false }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [reschedDate, setReschedDate] = useState('');
  const [reschedSlot, setReschedSlot] = useState(TIME_SLOTS[0]);
  const [showReschedModal, setShowReschedModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDoctorId, setReviewDoctorId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getMyAppointments();
      setAppointments(res.data.appointments || []);
    } catch {
      setAlert({ type: 'error', message: 'Failed to load appointments.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await doctorService.getAllDoctors();
      setDoctors(res.data.doctors || []);
      if (res.data.doctors?.length > 0) setSelectedDoctor(res.data.doctors[0]._id);
    } catch { /* ignore */ }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    setActionLoading(true);
    try {
      await appointmentService.bookAppointment({ doctorId: selectedDoctor, appointmentDate: selectedDate, timeSlot: selectedSlot, symptoms });
      setAlert({ type: 'success', message: '🎉 Appointment requested! Awaiting admin approval.' });
      setSymptoms(''); setSelectedDate(''); setSelectedSlot('');
      fetchAppointments();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to request appointment.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    setActionLoading(true);
    try {
      await appointmentService.cancelAppointment(id);
      setAlert({ type: 'success', message: 'Appointment cancelled.' });
      fetchAppointments();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Cancellation failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openRescheduleModal = (app) => {
    setRescheduleTarget(app._id);
    setReschedDate(new Date(app.appointmentDate).toISOString().slice(0, 10));
    setReschedSlot(app.timeSlot);
    setShowReschedModal(true);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget || !reschedDate || !reschedSlot) return;
    setActionLoading(true);
    try {
      await appointmentService.rescheduleAppointment(rescheduleTarget, { appointmentDate: reschedDate, timeSlot: reschedSlot });
      setAlert({ type: 'success', message: '✅ Rescheduled successfully!' });
      setShowReschedModal(false);
      fetchAppointments();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Rescheduling failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const [reviewApptId, setReviewApptId] = useState(null);

  const openReviewModal = (app) => {
    setReviewDoctorId(app.doctorId?._id || app.doctorId);
    setReviewApptId(app._id);
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewDoctorId || !reviewApptId || !rating) return;
    setActionLoading(true);
    try {
      import('../services/api').then(module => {
        return module.patientService.addReview(reviewDoctorId, reviewApptId, rating, comment);
      }).then(() => {
        setAlert({ type: 'success', message: '⭐ Review submitted successfully!' });
        setShowReviewModal(false);
        fetchAppointments();
      }).catch(err => {
        setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to submit review.' });
      }).finally(() => {
        setActionLoading(false);
      });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to submit review.' });
      setActionLoading(false);
    }
  };

  const todayStr = () => new Date().toISOString().split('T')[0];
  const selectedDoctorObj = doctors.find(d => d._id === selectedDoctor);

  const todayAppointments = appointments.filter(a => {
    const appDate = new Date(a.appointmentDate);
    const today = new Date();
    return appDate.getFullYear() === today.getFullYear() &&
           appDate.getMonth() === today.getMonth() &&
           appDate.getDate() === today.getDate();
  });

  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const historyAppointments = appointments; // Show all appointments including cancellations

  const statusCounts = historyMode
    ? {
        pending: pendingAppointments.length,
        completed: completedAppointments.length,
      }
    : todayAppointments.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1; return acc;
      }, {});

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filteredAppointments = (() => {
    if (!historyMode) {
      return activeFilter === 'all'
        ? todayAppointments
        : todayAppointments.filter(a => a.status === activeFilter);
    }

    return activeFilter === 'all'
      ? historyAppointments
      : historyAppointments.filter(a => a.status === activeFilter);
  })();

  const headerTitle = historyMode ? 'Appointment History' : 'Appointments';
  const headerSubtitle = historyMode
    ? 'Review all your appointments, including cancelled ones.'
    : 'Book, manage, and track all your consultations';

  const gridClassName = showBooking ? 'apt-grid' : 'apt-grid apt-grid--single';

  return (
    <div className="apt-page">
      {/* ── Page Header ── */}
      <div className="apt-page-header">
        <div className="apt-page-header-left">
          <div className="apt-page-icon">
            <CalendarPlus size={22} color="white" />
          </div>
          <div>
            <h1 className="apt-page-title">{headerTitle}</h1>
            <p className="apt-page-subtitle">{headerSubtitle}</p>
          </div>
        </div>
        <div className="apt-stats-row">
          <div className="apt-mini-stat">
            <span className="apt-mini-stat-val">{historyMode ? historyAppointments.length : appointments.length}</span>
            <span className="apt-mini-stat-label">Total</span>
          </div>
          <div className="apt-mini-stat apt-mini-stat--success">
            <span className="apt-mini-stat-val">{historyMode ? completedAppointments.length : statusCounts.approved || 0}</span>
            <span className="apt-mini-stat-label">{historyMode ? 'Completed' : 'Approved'}</span>
          </div>
          <div className="apt-mini-stat apt-mini-stat--warning">
            <span className="apt-mini-stat-val">{historyMode ? pendingAppointments.length : statusCounts.pending || 0}</span>
            <span className="apt-mini-stat-label">{historyMode ? 'Pending' : 'Pending'}</span>
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className={gridClassName}>

        {/* ── LEFT: Booking Form ── */}
        {showBooking && (
          <div className="apt-form-card">
            <div className="apt-card-header">
              <div className="apt-card-header-icon apt-card-header-icon--purple">
                <CalendarPlus size={16} color="white" />
              </div>
              <div>
                <h3 className="apt-card-title">Book Appointment</h3>
                <p className="apt-card-subtitle">Schedule a consultation with a specialist</p>
              </div>
            </div>

            <form onSubmit={handleBook} className="apt-form">
            {/* Doctor Select */}
            <div className="apt-field">
              <label className="apt-label">
                <Stethoscope size={13} />
                Select Doctor <span className="apt-req">*</span>
              </label>
              <div className="apt-select-wrap">
                <select
                  value={selectedDoctor}
                  onChange={e => setSelectedDoctor(e.target.value)}
                  required
                  className="apt-select"
                >
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.name} — {d.department?.name || d.department}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="apt-select-icon" />
              </div>
            </div>

            {/* Doctor Info Card */}
            {selectedDoctorObj && (
              <div className="apt-doctor-preview">
                <div className="apt-doctor-preview-avatar">
                  <User size={18} color="#a78bfa" />
                </div>
                <div className="apt-doctor-preview-info">
                  <span className="apt-doctor-preview-name">{selectedDoctorObj.name}</span>
                  <span className="apt-doctor-preview-dept">{selectedDoctorObj.department?.name || selectedDoctorObj.department}</span>
                </div>
                <div className="apt-doctor-preview-meta">
                  {selectedDoctorObj.experience && (
                    <span className="apt-doctor-preview-badge">
                      <Award size={11} /> {selectedDoctorObj.experience} yrs
                    </span>
                  )}
                  {selectedDoctorObj.consultationFee && (
                    <span className="apt-doctor-preview-badge apt-doctor-preview-badge--cyan">
                      <Banknote size={11} /> ₹{selectedDoctorObj.consultationFee}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Date & Slot */}
            <div className="apt-row-2">
              <div className="apt-field">
                <label className="apt-label">
                  <Calendar size={13} />
                  Date <span className="apt-req">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  min={todayStr()}
                  required
                  className="apt-input"
                />
              </div>
              <div className="apt-field">
                <label className="apt-label">
                  <Clock size={13} />
                  Time Slot <span className="apt-req">*</span>
                </label>
                <div className="apt-select-wrap">
                  <select
                    value={selectedSlot}
                    onChange={e => setSelectedSlot(e.target.value)}
                    required
                    className="apt-select"
                  >
                    <option value="">Select slot</option>
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="apt-select-icon" />
                </div>
              </div>
            </div>

            {/* Time Slot Quick Pick */}
            <div className="apt-field">
              <label className="apt-label" style={{ marginBottom: '0.5rem' }}>
                Quick Time Select
              </label>
              <div className="apt-slot-grid">
                {TIME_SLOTS.map(slot => (
                  <button
                    type="button"
                    key={slot}
                    className={`apt-slot-chip ${selectedSlot === slot ? 'active' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="apt-field">
              <label className="apt-label">
                <ClipboardList size={13} />
                Symptoms / Notes <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="Describe your symptoms, e.g. fever, cough, joint pain, routine checkup…"
                rows={3}
                className="apt-textarea"
              />
            </div>

            {/* Info notice */}
            <div className="apt-notice">
              <Info size={13} />
              <span>Appointment will be confirmed after admin approval</span>
            </div>

            <button type="submit" className="apt-submit-btn" disabled={actionLoading || !selectedDoctor || !selectedDate || !selectedSlot}>
              {actionLoading
                ? <><Loader2 size={16} className="apt-spin" /> Processing…</>
                : <><CalendarPlus size={16} /> Schedule Appointment</>
              }
            </button>
          </form>
        </div>
        )}

        {/* ── RIGHT: Today's Reminders (Book Mode) / Appointments List (History Mode) ── */}
        {!historyMode ? (
          /* ── TODAY'S REMINDERS PANEL ── */
          <div className="apt-list-card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Glowing reminder header */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(6,182,212,0.15) 100%)',
              borderRadius: '14px 14px 0 0',
              padding: '1rem 1.25rem 0.875rem',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative glow blob */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(124,58,237,0.18)', filter: 'blur(30px)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', borderRadius: 10, padding: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={15} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>Today's Reminders</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: todayAppointments.length > 0 ? 'rgba(124,58,237,0.2)' : 'rgba(100,116,139,0.15)',
                  color: todayAppointments.length > 0 ? 'var(--primary-light)' : 'var(--text-muted)',
                  border: `1px solid ${todayAppointments.length > 0 ? 'rgba(124,58,237,0.35)' : 'rgba(100,116,139,0.2)'}`,
                  borderRadius: 20,
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  {todayAppointments.length} today
                </div>
              </div>
            </div>

            {/* Reminder cards list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem' }}>
              {loading ? (
                <div className="apt-list-loading">
                  <Loader2 size={28} className="apt-spin" />
                  <span>Loading reminders…</span>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗓️</div>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 0.35rem' }}>No appointments today</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Your schedule is clear! Book a consultation using the form.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {todayAppointments.map((app, idx) => {
                    const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
                    const canAct = ['pending', 'approved'].includes(app.status);
                    return (
                      <div key={app._id} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1px solid ${cfg.border}`,
                        borderLeft: `3px solid ${cfg.color}`,
                        borderRadius: 12,
                        padding: '0.875rem 1rem',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Subtle glow accent */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${cfg.color}55, transparent)`, borderRadius: '12px 12px 0 0' }} />

                        {/* Time badge + status */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={13} style={{ color: cfg.color }} />
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: cfg.color }}>{app.timeSlot}</span>
                          </div>
                          <div style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '0.15rem 0.55rem', fontSize: '0.67rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <StatusIcon size={10} /> {cfg.label}
                          </div>
                        </div>

                        {/* Doctor info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: app.symptoms ? '0.6rem' : (canAct ? '0.6rem' : 0) }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Stethoscope size={16} color="#a78bfa" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{app.doctorId?.name || 'Doctor'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{app.doctorId?.department?.name || app.doctorId?.department}</div>
                          </div>
                          {app.consultationFee && (
                            <div style={{ marginLeft: 'auto', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Banknote size={12} style={{ color: 'var(--text-secondary)' }} /> ₹{app.consultationFee}
                            </div>
                          )}
                        </div>

                        {app.symptoms && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '0.35rem 0.6rem', marginBottom: canAct ? '0.6rem' : 0 }}>
                            <ClipboardList size={11} /> {app.symptoms}
                          </div>
                        )}

                        {canAct && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="apt-action-btn apt-action-btn--secondary" style={{ flex: 1 }} onClick={() => openRescheduleModal(app)} disabled={actionLoading}>
                              <RotateCcw size={12} /> Reschedule
                            </button>
                            <button className="apt-action-btn apt-action-btn--danger" style={{ flex: 1 }} onClick={() => handleCancel(app._id)} disabled={actionLoading}>
                              <X size={12} /> Cancel
                            </button>
                          </div>
                        )}

                        {/* Rating option removed from Book Appointment tab, kept only in History */}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── HISTORY MODE: Full Appointments List ── */
          <div className="apt-list-card">
            <div className="apt-card-header">
              <div className="apt-card-header-icon apt-card-header-icon--cyan">
                <ClipboardList size={16} color="white" />
              </div>
              <div>
                <h3 className="apt-card-title">Appointment History
                  <span className="apt-count-badge">{historyAppointments.length}</span>
                </h3>
                <p className="apt-card-subtitle">All your past and upcoming appointments</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="apt-filter-tabs">
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`apt-filter-tab ${activeFilter === f.key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f.key)}
                >
                  {f.label}
                  {f.key !== 'all' && statusCounts[f.key]
                    ? <span className="apt-filter-count">{statusCounts[f.key]}</span>
                    : null
                  }
                </button>
              ))}
            </div>

            {/* List */}
            <div className="apt-list-body">
              {loading ? (
                <div className="apt-list-loading">
                  <Loader2 size={28} className="apt-spin" />
                  <span>Loading appointments…</span>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="apt-list-empty">
                  <div className="apt-list-empty-icon">📅</div>
                  <p className="apt-list-empty-title">
                    {activeFilter === 'all' ? 'No appointments found' : `No ${activeFilter} appointments`}
                  </p>
                  <p className="apt-list-empty-sub">You do not have any appointments in your history.</p>
                </div>
              ) : (
                <div className="apt-cards-list">
                  {filteredAppointments.map(app => {
                    const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
                    const canAct = ['pending', 'approved'].includes(app.status);
                    return (
                      <div key={app._id} className="apt-appt-card" style={{ '--apt-status-color': cfg.color, '--apt-status-bg': cfg.bg, '--apt-status-border': cfg.border }}>
                        <div className="apt-appt-card-top">
                          <div className="apt-appt-doctor">
                            <div className="apt-appt-doctor-avatar">
                              <Stethoscope size={15} color="#a78bfa" />
                            </div>
                            <div>
                              <div className="apt-appt-doctor-name">{app.doctorId?.name || 'Doctor'}</div>
                              <div className="apt-appt-doctor-dept">{app.doctorId?.department?.name || app.doctorId?.department}</div>
                            </div>
                          </div>
                          <div className="apt-appt-status-pill" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                            <StatusIcon size={11} />
                            {cfg.label}
                          </div>
                        </div>

                        <div className="apt-appt-meta">
                          <div className="apt-appt-meta-item">
                            <Calendar size={12} />
                            <span>{new Date(app.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="apt-appt-meta-sep">•</div>
                          <div className="apt-appt-meta-item">
                            <Clock size={12} />
                            <span>{app.timeSlot}</span>
                          </div>
                          {app.consultationFee && (
                            <>
                              <div className="apt-appt-meta-sep">•</div>
                              <div className="apt-appt-meta-item">
                                <Banknote size={12} />
                                <span>₹{app.consultationFee}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {app.symptoms && (
                          <div className="apt-appt-symptoms">
                            <ClipboardList size={11} />
                            <span>{app.symptoms}</span>
                          </div>
                        )}

                        {canAct && (
                          <div className="apt-appt-actions">
                            <button className="apt-action-btn apt-action-btn--secondary" onClick={() => openRescheduleModal(app)} disabled={actionLoading}>
                              <RotateCcw size={13} /> Reschedule
                            </button>
                            <button className="apt-action-btn apt-action-btn--danger" onClick={() => handleCancel(app._id)} disabled={actionLoading}>
                              <X size={13} /> Cancel
                            </button>
                          </div>
                        )}

                        {app.status === 'completed' && !app.isReviewed && (
                          <div className="apt-appt-actions">
                            <button className="apt-action-btn apt-action-btn--secondary" style={{ width: '100%', background: 'rgba(234,179,8,0.1)', color: '#eab308', borderColor: 'rgba(234,179,8,0.3)', justifyContent: 'center' }} onClick={() => openReviewModal(app)} disabled={actionLoading}>
                              ⭐ Rate Doctor
                            </button>
                          </div>
                        )}

                        {app.status === 'completed' && app.isReviewed && (
                          <div className="apt-appt-actions">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.45rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.78rem', color: 'var(--text-secondary)', width: '100%' }}>
                              <Award size={12} style={{ color: '#eab308' }} /> You rated this {app.rating}⭐
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Reschedule Modal ── */}
      {showReschedModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowReschedModal(false); }}>
          <div className="modal apt-resched-modal">
            <div className="modal-header">
              <div className="modal-title">
                <div className="apt-modal-icon">
                  <RotateCcw size={16} color="white" />
                </div>
                Reschedule Appointment
              </div>
              <button className="modal-close" onClick={() => setShowReschedModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReschedule}>
              <div className="modal-body">
                <div className="apt-field">
                  <label className="apt-label"><Calendar size={13} /> New Date <span className="apt-req">*</span></label>
                  <input type="date" value={reschedDate} onChange={e => setReschedDate(e.target.value)} min={todayStr()} required className="apt-input" />
                </div>
                <div className="apt-field" style={{ marginTop: '0.875rem' }}>
                  <label className="apt-label" style={{ marginBottom: '0.5rem' }}>New Time Slot <span className="apt-req">*</span></label>
                  <div className="apt-slot-grid">
                    {TIME_SLOTS.map(slot => (
                      <button type="button" key={slot} className={`apt-slot-chip ${reschedSlot === slot ? 'active' : ''}`} onClick={() => setReschedSlot(slot)}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowReschedModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading || !reschedDate || !reschedSlot}>
                  {actionLoading ? 'Updating…' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowReviewModal(false); }}>
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="apt-modal-icon">
                  <Award size={16} color="white" />
                </div>
                Rate Doctor
              </div>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>✕</button>
            </div>
            <form onSubmit={submitReview}>
              <div className="modal-body">
                <div className="apt-field">
                  <label className="apt-label">Rating (1-5)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRating(num)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: rating === num ? 'rgba(234,179,8,0.2)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${rating === num ? '#eab308' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '8px',
                          color: rating === num ? '#eab308' : 'white',
                          fontSize: '1.25rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {rating >= num ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="apt-field" style={{ marginTop: '0.875rem' }}>
                  <label className="apt-label">Comment (optional)</label>
                  <textarea
                    className="apt-textarea"
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    style={{ resize: 'none', padding: '0.75rem', minHeight: '80px' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading} style={{ background: '#eab308', color: 'black', border: 'none' }}>
                  {actionLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientAppointments;

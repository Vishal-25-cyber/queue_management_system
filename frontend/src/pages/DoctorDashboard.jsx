import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import PatientProfile from '../components/PatientProfile';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { doctorService, appointmentService } from '../services/api';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope, ClipboardList, Clock, CheckCircle2, Award,
  Megaphone, Info, FileEdit, Activity, Calendar, User,
  Banknote, XCircle, CheckCircle, AlertCircle, RotateCcw,
  Bell, ChevronRight, Loader2, X
} from 'lucide-react';
import '../styles/Dashboard.css';
import '../styles/PatientAppointments.css';

// ── Status config matching patient design ──
const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.3)',   icon: AlertCircle  },
  approved:  { label: 'Approved',  color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',    border: 'rgba(6,182,212,0.3)',    icon: CheckCircle  },
  completed: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',    border: 'rgba(34,197,94,0.3)',    icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.3)',    icon: XCircle      },
  rejected:  { label: 'Rejected',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.3)',    icon: XCircle      },
  waiting:   { label: 'Waiting',   color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',  border: 'rgba(167,139,250,0.3)', icon: Clock        },
};

const APPT_FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'approved',  label: 'Approved'  },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab]           = useState('dashboard');
  const [queue, setQueue]                   = useState([]);
  const [stats, setStats]                   = useState(null);
  const [appointments, setAppointments]     = useState([]);
  const [apptFilter, setApptFilter]         = useState('all');
  const [loading, setLoading]               = useState(true);
  const [apptLoading, setApptLoading]       = useState(false);
  const [alert, setAlert]                   = useState(null);
  const [callingLoading, setCallingLoading] = useState(false);
  const [currentToken, setCurrentToken]     = useState(null);
  const [consultNotes, setConsultNotes]     = useState('');
  const [showModal, setShowModal]           = useState(false);
  const [completeModal, setCompleteModal]   = useState(null);
  const [rejectModal, setRejectModal]       = useState(null);
  const [completeNotes, setCompleteNotes]   = useState('');
  const [rejectReason, setRejectReason]     = useState('');
  const [actionLoading, setActionLoading]   = useState(false);
  const [timer, setTimer]                   = useState(0);
  const { doctorOnline, callNextPatient, completeConsultation } = useQueue();

  useEffect(() => {
    fetchData();
    doctorOnline(null);
  }, []);

  useEffect(() => {
    if (activeTab === 'appointments') fetchAppointments();
  }, [activeTab]);

  useEffect(() => {
    let interval;
    if (currentToken) interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [currentToken]);

  const fetchData = async () => {
    try {
      const [queueRes, statsRes] = await Promise.all([
        doctorService.getTodayQueue(),
        doctorService.getDoctorStats(),
      ]);
      setQueue(queueRes.data.tokens || []);
      setStats(statsRes.data.stats);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setApptLoading(true);
    try {
      const res = await appointmentService.getDoctorAppointments();
      setAppointments(res.data.appointments || []);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to load appointments.' });
    } finally {
      setApptLoading(false);
    }
  };

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleCallNext = async () => {
    setCallingLoading(true);
    try {
      const res   = await doctorService.callNextPatient();
      const token = res.data.token;
      setCurrentToken(token);
      setTimer(0);
      callNextPatient({ doctorId: token.doctorId, tokenId: token._id, tokenNumber: token.tokenNumber });
      setAlert({ type: 'success', message: `📢 Token #${token.tokenNumber} — ${token.patientName} has been called.` });
      setTimeout(fetchData, 1000);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'No more patients in queue.' });
    } finally {
      setCallingLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentToken) return;
    try {
      const res   = await doctorService.completeConsultation(currentToken._id, { notes: consultNotes, duration: timer });
      const token = res.data.token;
      completeConsultation({ doctorId: token.doctorId, tokenId: token._id, tokenNumber: token.tokenNumber });
      setAlert({ type: 'success', message: `✅ Consultation with Token #${token.tokenNumber} completed.` });
      setCurrentToken(null); setConsultNotes(''); setTimer(0); setShowModal(false);
      setTimeout(fetchData, 800);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to complete consultation.' });
    }
  };

  const handleAcceptAppointment = async (app) => {
    setActionLoading(app._id);
    try {
      const res = await appointmentService.doctorAcceptAppointment(app._id);
      const msg = res.data.token
        ? `✅ Accepted! Patient added to today's queue.`
        : `✅ Appointment accepted successfully!`;
      setAlert({ type: 'success', message: msg });
      await fetchAppointments();
      if (res.data.token) await fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to accept appointment.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAppointmentFromCard = async (app) => {
    const confirmed = window.confirm('Reject this appointment?');
    if (!confirmed) return;

    setActionLoading(app._id);
    try {
      await appointmentService.doctorRejectAppointment(app._id, { reason: 'Rejected by doctor' });
      setAlert({ type: 'error', message: '❌ Appointment rejected.' });
      await fetchAppointments();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to reject appointment.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAppointment = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal._id);
    try {
      await appointmentService.doctorRejectAppointment(rejectModal._id, { reason: rejectReason });
      setAlert({ type: 'error', message: '❌ Appointment rejected.' });
      setRejectModal(null); setRejectReason('');
      fetchAppointments();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to reject appointment.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteAppointment = async () => {
    if (!completeModal) return;
    setActionLoading(completeModal._id);
    try {
      await appointmentService.doctorCompleteAppointment(completeModal._id, { notes: completeNotes });
      setAlert({ type: 'success', message: 'Appointment marked as completed!' });
      setCompleteModal(null); setCompleteNotes('');
      fetchAppointments();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to complete appointment.' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAppointments = apptFilter === 'all'
    ? appointments
    : appointments.filter(a => a.status === apptFilter);

  const apptStatusCounts = appointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1; return acc;
  }, {});

  const todayAppts = appointments.filter(a => {
    const d = new Date(a.appointmentDate); const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  });

  const waiting   = queue.filter(t => t.status === 'waiting');
  const completed = queue.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
        <LoadingSpinner message="Loading your dashboard…" />
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

          {/* ── DASHBOARD TAB ── */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-container">
              <div className="dashboard-header">
                <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Stethoscope size={32} style={{ color: 'var(--primary)' }} /> Doctor Dashboard
                </h1>
                <p className="dashboard-subtitle">Welcome, {user?.name} — manage your today's patient queue</p>
              </div>

              {stats && (
                <div className="stats-grid">
                  {[
                    { label: "Today's Consultations", value: stats.todayConsultations, sub: 'Completed today',       icon: ClipboardList, colorClass: 'blue',   color: '#2563eb' },
                    { label: 'Waiting',               value: stats.waitingPatients,   sub: 'Patients in queue',     icon: Clock,         colorClass: 'orange', color: '#d97706', valueColor: 'var(--warning-dark)' },
                    { label: 'Today Appointments',    value: todayAppts.length,       sub: 'Scheduled for today',   icon: Calendar,      colorClass: 'cyan',   color: '#0891b2' },
                    { label: 'My Rating',             value: stats.rating ? `${stats.rating} ⭐` : 'N/A', sub: `${stats.totalRatings || 0} reviews`, icon: Award, colorClass: 'purple', color: '#7c3aed', valueColor: '#eab308' },
                  ].map(c => (
                    <div key={c.label} className="stat-card">
                      <div className="stat-card-header">
                        <span className="stat-card-label">{c.label}</span>
                        <div className={`stat-card-icon ${c.colorClass}`}>
                          <c.icon size={20} style={{ color: c.color }} />
                        </div>
                      </div>
                      <div className="stat-value" style={c.valueColor ? { color: c.valueColor } : {}}>{c.value}</div>
                      <p className="stat-card-meta">{c.sub}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Today's Appointments Quick View */}
              {todayAppts.length > 0 && (
                <div className="dashboard-sub-card" style={{ marginBottom: '1.5rem', borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Bell size={18} style={{ color: 'var(--primary-light)' }} />
                      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
                        Today's Appointment Reminders
                      </h3>
                      <span style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--primary-light)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '0.1rem 0.55rem', fontSize: '0.72rem', fontWeight: 700 }}>
                        {todayAppts.length}
                      </span>
                    </div>
                    <button onClick={() => setActiveTab('appointments')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-light)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      View all <ChevronRight size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {todayAppts.slice(0, 3).map(app => {
                      const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                      return (
                        <div key={app._id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.625rem 0.875rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid ${cfg.border}`, borderLeft: `3px solid ${cfg.color}` }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: cfg.color, minWidth: 60 }}>{app.timeSlot}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{app.patientId?.name || 'Patient'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{app.symptoms || 'General Consultation'}</div>
                          </div>
                          <div style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '0.15rem 0.55rem', fontSize: '0.68rem', fontWeight: 700 }}>
                            {cfg.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Reviews */}
              {stats?.reviews && stats.reviews.length > 0 && (
                <div className="dashboard-sub-card" style={{ marginBottom: '1.5rem', borderLeft: '3px solid #eab308' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Award size={18} style={{ color: '#eab308' }} />
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>
                      Patient Reviews
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {stats.reviews.slice(-5).reverse().map((review, idx) => (
                      <div key={idx} style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: `1px solid rgba(234,179,8,0.2)` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{review.patientName || 'Patient'}</div>
                          <div style={{ color: '#eab308', fontSize: '0.85rem' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                        </div>
                        {review.comment && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '0.4rem' }}>"{review.comment}"</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Consultation Banner */}
              {currentToken && (
                <div className="consultation-active">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem', fontWeight: 700 }}>
                        <Activity size={14} className="pulse" /> ACTIVE CONSULTATION
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
                        Token #{currentToken.tokenNumber} — {currentToken.patientName}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={16} /> Duration: {fmtTime(timer)}
                      </div>
                    </div>
                    <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)', color: 'white', padding: '0.875rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => setShowModal(true)}>
                      <CheckCircle2 size={16} /> Complete Consultation
                    </button>
                  </div>
                </div>
              )}

              {/* Queue Management */}
              <div className="queue-section">
                <div className="queue-section-header">
                  <div>
                    <div className="queue-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ClipboardList size={22} style={{ color: 'var(--primary)' }} /> Patient Queue
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>
                      {waiting.length} patient{waiting.length !== 1 ? 's' : ''} waiting
                    </div>
                  </div>
                  <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={handleCallNext} disabled={callingLoading || waiting.length === 0 || !!currentToken}>
                    <Megaphone size={16} /> {callingLoading ? 'Calling…' : 'Call Next Patient'}
                  </button>
                </div>

                {queue.length === 0 ? (
                  <div className="empty-state" style={{ padding: '3rem 2rem' }}>
                    <span className="empty-state-icon" style={{ display: 'inline-flex', justifyContent: 'center' }}>
                      <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
                    </span>
                    <div className="empty-state-title">Queue is clear!</div>
                    <p className="empty-state-text">No patients in queue today. You're all caught up.</p>
                  </div>
                ) : (
                  <div className="queue-list">
                    {waiting.map((token, idx) => (
                      <div key={token._id} className={`queue-item${idx === 0 ? ' is-next' : ''}`}>
                        <div className="queue-item-number">{idx === 0 ? '→' : `#${idx + 1}`}</div>
                        <div className="queue-item-info">
                          <div className="queue-item-name">{token.patientName}</div>
                          <div className="queue-item-meta">Token #{token.tokenNumber} · Position #{token.queuePosition}</div>
                        </div>
                        <span className="status-pill waiting">Waiting</span>
                      </div>
                    ))}
                    {completed.length > 0 && (
                      <>
                        <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>✅ Completed Today</div>
                        {completed.map(token => (
                          <div key={token._id} className="queue-item is-completed">
                            <div className="queue-item-number" style={{ color: 'var(--success)', opacity: 0.6 }}>✓</div>
                            <div className="queue-item-info">
                              <div className="queue-item-name" style={{ opacity: 0.7 }}>{token.patientName}</div>
                              <div className="queue-item-meta">Token #{token.tokenNumber}</div>
                            </div>
                            <span className="status-pill completed">Completed</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Workflow guide */}
              <div className="section-header">
                <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="section-title-icon"><Info size={18} style={{ color: 'white' }} /></div>
                  Daily Workflow
                </h2>
              </div>
              <div className="info-card">
                <ol>
                  <li><strong>Check Appointments:</strong> View today's scheduled appointments in the Appointments tab</li>
                  <li><strong>Check Queue:</strong> See all waiting patients in the queue panel above</li>
                  <li><strong>Call Patient:</strong> Click "Call Next Patient" when you're ready</li>
                  <li><strong>Consult:</strong> The timer tracks consultation duration automatically</li>
                  <li><strong>Complete:</strong> Click "Complete Consultation" to move to the next patient</li>
                </ol>
              </div>
            </div>
          )}

          {/* ── APPOINTMENTS TAB ── */}
          {activeTab === 'appointments' && (
            <div className="dashboard-container">
              <div className="dashboard-header">
                <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar size={30} style={{ color: 'var(--primary)' }} /> My Appointments
                </h1>
                <p className="dashboard-subtitle">All appointments scheduled with you by patients</p>
              </div>

              {/* Stats row */}
              <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                {[
                  { label: 'Total',     value: appointments.length,                                      color: '#a78bfa' },
                  { label: 'Pending',   value: apptStatusCounts.pending   || 0,                          color: '#f59e0b' },
                  { label: 'Approved',  value: apptStatusCounts.approved  || 0,                          color: '#06b6d4' },
                  { label: 'Completed', value: apptStatusCounts.completed || 0,                          color: '#22c55e' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-card-header">
                      <span className="stat-card-label">{s.label}</span>
                    </div>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Filter tabs — styled same as patient page */}
              <div className="apt-filter-tabs" style={{ marginBottom: '1.25rem' }}>
                {APPT_FILTERS.map(f => (
                  <button
                    key={f.key}
                    className={`apt-filter-tab ${apptFilter === f.key ? 'active' : ''}`}
                    onClick={() => setApptFilter(f.key)}
                  >
                    {f.label}
                    {f.key !== 'all' && apptStatusCounts[f.key]
                      ? <span className="apt-filter-count">{apptStatusCounts[f.key]}</span>
                      : null}
                  </button>
                ))}
              </div>

              {/* Appointment cards */}
              {apptLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                  <Loader2 size={28} className="apt-spin" /><span>Loading appointments…</span>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>
                    {apptFilter === 'all' ? 'No appointments yet' : `No ${apptFilter} appointments`}
                  </p>
                  <p style={{ fontSize: '0.8rem', margin: 0 }}>Appointments booked by patients will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {filteredAppointments.map(app => {
                    const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
                    const isPending = app.status === 'pending';
                    const isApproved = app.status === 'approved';
                    return (
                      <div key={app._id} style={{
                        background: 'var(--card-bg)',
                        border: `1px solid ${cfg.border}`,
                        borderLeft: `4px solid ${cfg.color}`,
                        borderRadius: 14,
                        padding: '1rem 1.25rem',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}>
                        {/* Top accent line */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${cfg.color}55, transparent)` }} />

                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                          {/* Left: patient info */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <User size={20} color="#a78bfa" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{app.patientId?.name || 'Patient'}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{app.patientId?.phone || app.patientId?.email}</div>
                            </div>
                          </div>

                          {/* Right: status */}
                          <div style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 20, padding: '0.25rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <StatusIcon size={11} /> {cfg.label}
                          </div>
                        </div>

                        {/* Meta row */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.875rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={13} style={{ color: cfg.color }} />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {new Date(app.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={13} style={{ color: cfg.color }} />
                            <span style={{ fontWeight: 700, color: cfg.color }}>{app.timeSlot}</span>
                          </div>
                          {app.consultationFee && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Banknote size={13} />
                              <span>₹{app.consultationFee}</span>
                            </div>
                          )}
                          {app.patientId?.age && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <User size={13} />
                              <span>Age: {app.patientId.age}</span>
                            </div>
                          )}
                          {app.patientId?.gender && (
                            <span style={{ textTransform: 'capitalize' }}>{app.patientId.gender}</span>
                          )}
                        </div>

                        {/* Symptoms */}
                        {app.symptoms && (
                          <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '0.35rem 0.65rem' }}>
                            <ClipboardList size={12} /> {app.symptoms}
                          </div>
                        )}

                        {/* Action */}
                        {isPending && (
                          <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleAcceptAppointment(app)}
                              disabled={actionLoading === app._id}
                              style={{ padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #059669, #22c55e)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: actionLoading === app._id ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', opacity: actionLoading === app._id ? 0.8 : 1 }}>
                              <CheckCircle2 size={14} /> {actionLoading === app._id ? 'Processing…' : 'Accept Appointment'}
                            </button>
                            <button
                              onClick={() => handleRejectAppointmentFromCard(app)}
                              disabled={actionLoading === app._id}
                              style={{ padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: actionLoading === app._id ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <XCircle size={14} /> Reject Appointment
                            </button>
                          </div>
                        )}

                        {isApproved && (
                          <div style={{ marginTop: '0.875rem' }}>
                            <button
                              onClick={() => { setCompleteModal(app); setCompleteNotes(''); }}
                              style={{ padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #059669, #22c55e)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <CheckCircle2 size={14} /> Mark as Completed
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <PatientProfile setAlert={setAlert} />
          )}
        </main>
      </div>

      {/* ── Queue Complete Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileEdit size={20} style={{ color: 'var(--primary)' }} /> Complete Consultation
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--gray-500)', marginBottom: '1rem', fontSize: '0.9375rem' }}>
                Patient: <strong>{currentToken?.patientName}</strong> · Token #{currentToken?.tokenNumber} · Duration: {fmtTime(timer)}
              </p>
              <div className="form-group">
                <label>Consultation Notes <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
                <textarea rows={5} value={consultNotes} onChange={e => setConsultNotes(e.target.value)}
                  placeholder="e.g., Diagnosed with seasonal flu. Prescribed antibiotics for 5 days." style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-success" onClick={handleComplete} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} /> Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Appointment Complete Modal ── */}
      {completeModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setCompleteModal(null); }}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} /> Complete Appointment
              </div>
              <button className="modal-close" onClick={() => setCompleteModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--gray-500)', marginBottom: '1rem' }}>
                Patient: <strong>{completeModal.patientId?.name}</strong> · {completeModal.timeSlot} on {new Date(completeModal.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <div className="form-group">
                <label>Notes / Prescription <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
                <textarea rows={4} value={completeNotes} onChange={e => setCompleteNotes(e.target.value)}
                  placeholder="e.g., Prescribed antibiotics, follow-up in 1 week." style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setCompleteModal(null)}>Cancel</button>
              <button className="btn-success" onClick={handleCompleteAppointment} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} /> Mark as Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;

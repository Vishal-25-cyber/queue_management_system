import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import PatientProfile from '../components/PatientProfile';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { doctorService } from '../services/api';
import { useQueue } from '../context/QueueContext';
import { useAuth } from '../context/AuthContext';
import { 
  Stethoscope, 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  Award, 
  Megaphone, 
  Info, 
  FileEdit, 
  Activity 
} from 'lucide-react';
import '../styles/Dashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab]           = useState('dashboard');
  const [queue, setQueue]                   = useState([]);
  const [stats, setStats]                   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [alert, setAlert]                   = useState(null);
  const [callingLoading, setCallingLoading] = useState(false);
  const [currentToken, setCurrentToken]     = useState(null);
  const [consultNotes, setConsultNotes]     = useState('');
  const [showModal, setShowModal]           = useState(false);
  const [timer, setTimer]                   = useState(0);
  const { doctorOnline, callNextPatient, completeConsultation } = useQueue();

  useEffect(() => {
    fetchData();
    doctorOnline(null);
  }, []);

  useEffect(() => {
    let interval;
    if (currentToken) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
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
      setCurrentToken(null);
      setConsultNotes('');
      setTimer(0);
      setShowModal(false);
      setTimeout(fetchData, 800);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to complete consultation.' });
    }
  };

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

          {activeTab === 'dashboard' && (
            <div className="dashboard-container">
              {/* Header */}
              <div className="dashboard-header">
                <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Stethoscope size={32} style={{ color: 'var(--primary)' }} /> Doctor Dashboard
                </h1>
                <p className="dashboard-subtitle">
                  Welcome, {user?.name} — manage your today's patient queue
                </p>
              </div>

              {stats && (
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <span className="stat-card-label">Today's Consultations</span>
                      <div className="stat-card-icon blue">
                        <ClipboardList size={20} style={{ color: '#2563eb' }} />
                      </div>
                    </div>
                    <div className="stat-value">{stats.todayConsultations}</div>
                    <p className="stat-card-meta">Completed today</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <span className="stat-card-label">Waiting</span>
                      <div className="stat-card-icon orange">
                        <Clock size={20} style={{ color: '#d97706' }} />
                      </div>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--warning-dark)' }}>{stats.waitingPatients}</div>
                    <p className="stat-card-meta">Patients in queue</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <span className="stat-card-label">Completed Today</span>
                      <div className="stat-card-icon green">
                        <CheckCircle2 size={20} style={{ color: '#059669' }} />
                      </div>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{completed.length}</div>
                    <p className="stat-card-meta">Consultations done</p>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-header">
                      <span className="stat-card-label">Total All Time</span>
                      <div className="stat-card-icon purple">
                        <Award size={20} style={{ color: '#7c3aed' }} />
                      </div>
                    </div>
                    <div className="stat-value">{stats.totalConsultations}</div>
                    <p className="stat-card-meta">Lifetime consultations</p>
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
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', fontFamily: 'Poppins, sans-serif' }}>
                        Token #{currentToken.tokenNumber} — {currentToken.patientName}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={16} /> Duration: {fmtTime(timer)}
                      </div>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)', color: 'white', padding: '0.875rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={() => setShowModal(true)}
                    >
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
                  <button
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={handleCallNext}
                    disabled={callingLoading || waiting.length === 0 || !!currentToken}
                  >
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
                    {/* Waiting patients */}
                    {waiting.map((token, idx) => (
                      <div key={token._id} className={`queue-item${idx === 0 ? ' is-next' : ''}`}>
                        <div className="queue-item-number">
                          {idx === 0 ? '→' : `#${idx + 1}`}
                        </div>
                        <div className="queue-item-info">
                          <div className="queue-item-name">{token.patientName}</div>
                          <div className="queue-item-meta">Token #{token.tokenNumber} · Position #{token.queuePosition}</div>
                        </div>
                        <span className="status-pill waiting">Waiting</span>
                      </div>
                    ))}

                    {/* Completed patients */}
                    {completed.length > 0 && (
                      <>
                        <div style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          ✅ Completed Today
                        </div>
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
                  <div className="section-title-icon">
                    <Info size={18} style={{ color: 'white' }} />
                  </div>
                  Daily Workflow
                </h2>
              </div>
              <div className="info-card">
                <ol>
                  <li><strong>Check Queue:</strong> See all waiting patients in the queue panel above</li>
                  <li><strong>Call Patient:</strong> Click "Call Next Patient" when you're ready</li>
                  <li><strong>Consult:</strong> The timer tracks consultation duration automatically</li>
                  <li><strong>Add Notes:</strong> Document diagnoses and prescriptions (optional)</li>
                  <li><strong>Complete:</strong> Click "Complete Consultation" to move to the next patient</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <PatientProfile setAlert={setAlert} />
          )}
        </main>
      </div>

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
                <textarea
                  rows={5}
                  value={consultNotes}
                  onChange={e => setConsultNotes(e.target.value)}
                  placeholder="e.g., Diagnosed with seasonal flu. Prescribed antibiotics for 5 days. Follow up in 1 week if no improvement."
                  style={{ resize: 'vertical' }}
                />
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
    </div>
  );
};

export default DoctorDashboard;

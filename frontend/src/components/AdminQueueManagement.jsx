import React, { useState, useEffect } from 'react';
import { adminQueueService, adminService } from '../services/api';
import { useQueue } from '../context/QueueContext';
import ConfirmModal from './ConfirmModal';
import { 
  ClipboardList, 
  Ticket, 
  RefreshCw, 
  Megaphone, 
  Stethoscope, 
  CheckCircle2, 
  UserMinus 
} from 'lucide-react';

const AdminQueueManagement = ({ queueData, setAlert, fetchAll }) => {
  const { socket, callNextPatient, startConsultation, skipPatient, completeConsultation, resetQueue } = useQueue();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [activeQueue, setActiveQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Manual token states
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);

  // Complete consultation states
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [consultNotes, setConsultNotes] = useState('');

  // Reset queue states
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchQueueForDoctor(selectedDoctor);
    } else {
      setActiveQueue([]);
    }
  }, [selectedDoctor, queueData]); // Update queue live on socket triggers

  const fetchDoctors = async () => {
    try {
      // Get doctors list from stats/queueData
      const res = await adminService.getQueueStatus();
      setDoctors(res.data.queueData || []);
      if (res.data.queueData?.length > 0) {
        setSelectedDoctor(res.data.queueData[0].doctorId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await adminService.getAllPatients({ limit: 100 });
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQueueForDoctor = async (docId) => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // We query the doctor's tokens directly using the socket handler or api
      // Let's implement an endpoint to query all doctor tokens today
      // Wait, we can fetch all appointments for today which acts as tokens
      const res = await adminService.getAllAppointments();
      const allTokens = res.data.appointments || [];
      
      const filtered = allTokens.filter(t => 
        t.doctorId?._id === docId && 
        new Date(t.date).toDateString() === today.toDateString()
      );
      
      // Sort by status priority (waiting/called/in-consultation first) then token number
      const sorted = filtered.sort((a, b) => {
        const order = { 'in-consultation': 1, called: 2, waiting: 3, skipped: 4, completed: 5, cancelled: 6 };
        return (order[a.status] || 9) - (order[b.status] || 9) || a.tokenNumber - b.tokenNumber;
      });

      setActiveQueue(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallPatient = async () => {
    if (!selectedDoctor) return;
    setActionLoading(true);
    try {
      const res = await adminQueueService.callPatient(selectedDoctor);
      const token = res.data.token;
      
      // Emit socket event to notify patient
      callNextPatient({ doctorId: selectedDoctor, tokenId: token._id, tokenNumber: token.tokenNumber });
      setAlert({ type: 'success', message: `📢 Called Token #${token.tokenNumber} (${token.patientName})!` });
      fetchAll();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'No patients waiting.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartConsult = async (tokenId) => {
    setActionLoading(true);
    try {
      const res = await adminQueueService.startConsultation(tokenId);
      const token = res.data.token;
      
      // Emit socket event
      startConsultation({ doctorId: selectedDoctor, tokenId: token._id, tokenNumber: token.tokenNumber });
      setAlert({ type: 'success', message: `🩺 Consultation started for Token #${token.tokenNumber}!` });
      fetchAll();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to start consultation.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipPatient = async (tokenId) => {
    setActionLoading(true);
    try {
      const res = await adminQueueService.skipPatient(tokenId);
      const token = res.data.token;

      // Emit socket event
      skipPatient({ doctorId: selectedDoctor, tokenId: token._id, tokenNumber: token.tokenNumber });
      setAlert({ type: 'warning', message: `⏸ Token #${token.tokenNumber} skipped.` });
      fetchAll();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to skip patient.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openCompleteModal = (tokenId) => {
    setSelectedTokenId(tokenId);
    setConsultNotes('');
    setShowNotesModal(true);
  };

  const handleCompleteConsult = async () => {
    if (!selectedTokenId) return;
    setActionLoading(true);
    try {
      const res = await adminQueueService.completeConsultation(selectedTokenId, consultNotes);
      const token = res.data.token;

      // Emit socket event
      completeConsultation({ doctorId: selectedDoctor, tokenId: token._id, tokenNumber: token.tokenNumber });
      setAlert({ type: 'success', message: `✅ Consultation completed for Token #${token.tokenNumber}!` });
      setShowNotesModal(false);
      fetchAll();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to complete consultation.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetQueue = async () => {
    if (!selectedDoctor) return;
    setActionLoading(true);
    try {
      await adminQueueService.resetQueue(selectedDoctor);

      // Emit socket event
      resetQueue({ doctorId: selectedDoctor });
      setAlert({ type: 'success', message: '🔄 Today\'s queue has been reset successfully.' });
      setShowResetConfirm(false);
      fetchAll();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Reset failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateManualToken = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctor) return;
    setActionLoading(true);
    try {
      const res = await adminQueueService.generateManualToken(selectedPatient, selectedDoctor);
      const token = res.data.token;
      
      // Emit socket event
      if (socket?.connected) {
        socket.emit('token_booked', {
          doctorId: selectedDoctor,
          tokenId: token._id,
          tokenNumber: token.tokenNumber,
          queuePosition: token.queuePosition
        });
      }
      
      setAlert({ type: 'success', message: `Walk-in Token #${token.tokenNumber} booked for ${token.patientName}!` });
      setShowManualModal(false);
      setSelectedPatient('');
      fetchAll();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Booking failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const activeDoc = doctors.find(d => d.doctorId === selectedDoctor);

  return (
    <div className="queue-management-panel">
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="section-title-icon">
            <ClipboardList size={18} style={{ color: 'white' }} />
          </div>
          Queue Controller
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => setShowManualModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Ticket size={16} /> Walk-in Booking
          </button>
          <button className="btn-danger" onClick={() => setShowResetConfirm(true)} disabled={activeQueue.length === 0} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <RefreshCw size={16} /> Reset Queue
          </button>
        </div>
      </div>

      {/* Select Doctor Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <label style={{ fontWeight: 700, color: 'var(--gray-700)' }}>Select Active Doctor:</label>
          <select 
            value={selectedDoctor} 
            onChange={(e) => setSelectedDoctor(e.target.value)} 
            style={{ maxWidth: 360 }}
          >
            {doctors.map(d => (
              <option key={d.doctorId} value={d.doctorId}>{d.doctorName} ({d.department})</option>
            ))}
          </select>
        </div>

        {activeDoc && (
          <div className="doc-queue-summary-box">
            <span>Waiting: <strong>{activeDoc.waitingPatients}</strong></span>
            <span>Called: <strong>{activeDoc.calledPatients}</strong></span>
            <span>Completed: <strong>{activeDoc.completedConsultations}</strong></span>
          </div>
        )}
      </div>

      {/* Control Action Buttons */}
      {activeDoc && (
        <div className="queue-action-console">
          <button 
            className="btn-primary console-btn" 
            onClick={handleCallPatient} 
            disabled={actionLoading || activeDoc.waitingPatients === 0}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
          >
            <Megaphone size={18} /> Call Next Waiting Patient
          </button>
        </div>
      )}

      {/* Queue List Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading queue details…</div>
      ) : activeQueue.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <ClipboardList size={48} style={{ color: 'var(--gray-300)' }} />
          </span>
          <div className="empty-state-title">Queue is empty</div>
          <p className="empty-state-text">No tokens have been booked for this doctor today.</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Checked In</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeQueue.map((token) => (
                  <tr key={token._id}>
                    <td>
                      <div className="token-badge-sm">{token.tokenNumber}</div>
                    </td>
                    <td>
                      <strong>{token.patientName}</strong>
                    </td>
                    <td>
                      <span className={`status-pill ${token.status}`}>
                        {token.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td>{new Date(token.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <span className="notes-preview" title={token.notes}>
                        {token.notes || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {token.status === 'called' && (
                          <button className="btn-success-sm" onClick={() => handleStartConsult(token._id)} disabled={actionLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Stethoscope size={14} /> Start Consult
                          </button>
                        )}
                        {token.status === 'in-consultation' && (
                          <button className="btn-primary-sm" onClick={() => openCompleteModal(token._id)} disabled={actionLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={14} /> Complete
                          </button>
                        )}
                        {(token.status === 'waiting' || token.status === 'called') && (
                          <button className="btn-ghost-sm danger-text" onClick={() => handleSkipPatient(token._id)} disabled={actionLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <UserMinus size={14} /> Skip
                          </button>
                        )}
                        {token.status === 'completed' && <span style={{ color: 'var(--success)', fontWeight: 600 }}>Completed</span>}
                        {token.status === 'skipped' && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Skipped</span>}
                        {token.status === 'cancelled' && <span style={{ color: 'var(--gray-400)' }}>Cancelled</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Booking Modal */}
      {showManualModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowManualModal(false); }}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ticket size={20} style={{ color: 'var(--primary)' }} /> Walk-in Queue Booking
              </div>
              <button className="modal-close" onClick={() => setShowManualModal(false)}>✕</button>
            </div>
            <form onSubmit={handleGenerateManualToken}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Registered Patient *</label>
                  <select 
                    value={selectedPatient} 
                    onChange={e => setSelectedPatient(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowManualModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading || !selectedPatient}>
                  Book Walk-in Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Notes Modal */}
      {showNotesModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowNotesModal(false); }}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title">📝 Consultation Check-out</div>
              <button className="modal-close" onClick={() => setShowNotesModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Diagnosis & Prescription Notes</label>
                <textarea 
                  value={consultNotes} 
                  onChange={e => setConsultNotes(e.target.value)} 
                  placeholder="Enter medical advice, prescriptions, or notes…" 
                  rows={4}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={() => setShowNotesModal(false)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={handleCompleteConsult} disabled={actionLoading}>
                Mark Consultation Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation */}
      <ConfirmModal 
        isOpen={showResetConfirm}
        title="Reset Today's Queue?"
        message="Are you sure you want to reset the queue for this doctor? All waiting and called patients will be cancelled."
        onConfirm={handleResetQueue}
        onCancel={() => setShowResetConfirm(false)}
        type="danger"
        confirmText="Yes, Reset Queue"
      />
    </div>
  );
};

export default AdminQueueManagement;

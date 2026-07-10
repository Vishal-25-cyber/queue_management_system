import React, { useState, useEffect } from 'react';
import { appointmentService, doctorService } from '../services/api';
import { Ticket, Calendar, Clock, X, Trash2, Edit } from 'lucide-react';
import '../styles/Dashboard.css';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

const PatientAppointments = ({ setAlert }) => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [symptoms, setSymptoms] = useState('');

  // Reschedule states
  const [rescheduleTarget, setRescheduleTarget] = useState(null); // appointmentId
  const [reschedDate, setReschedDate] = useState('');
  const [reschedSlot, setReschedSlot] = useState(TIME_SLOTS[0]);
  const [showReschedModal, setShowReschedModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getMyAppointments();
      setAppointments(res.data.appointments || []);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load appointments.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await doctorService.getAllDoctors();
      setDoctors(res.data.doctors || []);
      if (res.data.doctors?.length > 0) {
        setSelectedDoctor(res.data.doctors[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    setActionLoading(true);
    try {
      await appointmentService.bookAppointment({
        doctorId: selectedDoctor,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        symptoms
      });
      setAlert({ type: 'success', message: '🎉 Appointment requested successfully! Pending administrator approval.' });
      setSymptoms('');
      setSelectedDate('');
      fetchAppointments();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to request appointment.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setActionLoading(true);
    try {
      await appointmentService.cancelAppointment(id);
      setAlert({ type: 'success', message: 'Appointment cancelled successfully.' });
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
      await appointmentService.rescheduleAppointment(rescheduleTarget, {
        appointmentDate: reschedDate,
        timeSlot: reschedSlot
      });
      setAlert({ type: 'success', message: '✅ Appointment rescheduled successfully! Pending approval.' });
      setShowReschedModal(false);
      fetchAppointments();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Rescheduling failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="patient-appointments-panel">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="mobile-stacked">
        {/* Booking Form */}
        <div className="dashboard-sub-card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Ticket size={18} style={{ color: 'var(--primary)' }} /> Book Future Appointment
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>Schedule a consultation slot with a specialist</p>

          <form onSubmit={handleBook}>
            <div className="form-group">
              <label>Select Doctor Specialist *</label>
              <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} required>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.department?.name || d.department})</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Select Date *</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={getTodayString()} required />
              </div>
              <div className="form-group">
                <label>Select Time Slot *</label>
                <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Brief Symptoms (optional)</label>
              <textarea 
                value={symptoms} 
                onChange={e => setSymptoms(e.target.value)} 
                placeholder="Fever, cough, checkup, joint pain…"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={actionLoading}>
              {actionLoading ? 'Processing…' : 'Schedule Appointment'}
            </button>
          </form>
        </div>

        {/* Appointments List */}
        <div className="dashboard-sub-card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} /> Scheduled Bookings ({appointments.length})
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '1.25rem' }}>Status and history of your requested slots</p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Loading appointments…</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state-sm">
              <p>No appointments booked yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {appointments.map((app) => (
                <div key={app._id} style={{ border: '1px solid var(--gray-200)', borderRadius: '8px', padding: '1rem', background: 'var(--gray-50)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{app.doctorId?.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>{app.doctorId?.department?.name || app.doctorId?.department}</span>
                    </div>
                    <span className={`status-pill ${app.status}`} style={{ fontSize: '0.7rem' }}>{app.status}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Calendar size={13} /> {new Date(app.appointmentDate).toLocaleDateString('en-IN')}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={13} /> {app.timeSlot}</span>
                  </div>

                  {app.symptoms && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                      Symptoms: {app.symptoms}
                    </div>
                  )}

                  {['pending', 'approved'].includes(app.status) && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <button className="btn-secondary-sm" style={{ flex: 1, padding: '0.3rem' }} onClick={() => openRescheduleModal(app)}>
                        Reschedule
                      </button>
                      <button className="btn-ghost-sm" style={{ color: 'var(--danger)', padding: '0.3rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }} onClick={() => handleCancel(app._id)}>
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {showReschedModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowReschedModal(false); }}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} style={{ color: 'var(--primary)' }} /> Reschedule Appointment
              </div>
              <button className="modal-close" onClick={() => setShowReschedModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReschedule}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select New Date *</label>
                  <input type="date" value={reschedDate} onChange={e => setReschedDate(e.target.value)} min={getTodayString()} required />
                </div>
                <div className="form-group">
                  <label>Select New Time Slot *</label>
                  <select value={reschedSlot} onChange={e => setReschedSlot(e.target.value)} required>
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowReschedModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>Update Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;

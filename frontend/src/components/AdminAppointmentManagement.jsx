import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/api';
import { Calendar, Clock, Check, X } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

const AdminAppointmentManagement = ({ setAlert, fetchAll: refreshStats }) => {
  const { socket } = useQueue();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('pending');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await appointmentService.adminGetAllAppointments(params);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load appointments list.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const res = await appointmentService.adminApproveAppointment(id);
      const { token } = res.data;
      
      setAlert({ 
        type: 'success', 
        message: token 
          ? `✅ Appointment approved! Walk-in Token #${token.tokenNumber} has been generated.`
          : '✅ Appointment approved successfully!' 
      });

      // If token generated today, push update to socket
      if (token && socket?.connected) {
        socket.emit('token_booked', {
          doctorId: token.doctorId._id || token.doctorId,
          tokenId: token._id,
          tokenNumber: token.tokenNumber,
          queuePosition: token.queuePosition
        });
      }

      fetchAppointments();
      if (refreshStats) refreshStats();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to approve.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await appointmentService.adminRejectAppointment(id);
      setAlert({ type: 'success', message: '✕ Appointment rejected successfully.' });
      fetchAppointments();
      if (refreshStats) refreshStats();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to reject.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="appointment-management-panel">
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="section-title-icon">
            <Calendar size={18} style={{ color: 'white' }} />
          </div>
          Appointments Manager
        </h2>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 160 }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="pending">Pending Approvals</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="all">All Appointments</option>
            </select>
          </div>
          <div style={{ minWidth: 180 }}>
            <input 
              type="date" 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)} 
              title="Filter by appointment date"
            />
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading appointments…</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <Calendar size={48} style={{ color: 'var(--gray-300)' }} />
          </span>
          <div className="empty-state-title">No appointments found</div>
          <p className="empty-state-text">No records match the active filters.</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Assigned Doctor</th>
                  <th>Date & Time Slot</th>
                  <th>Notes/Symptoms</th>
                  <th>Fee</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.patientId?.name || 'Walk-in / Unknown'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{app.patientId?.phone || 'No Phone'}</div>
                    </td>
                    <td>
                      <div>{app.doctorId?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{app.doctorId?.department?.name || app.doctorId?.department}</div>
                    </td>
                    <td>
                      <strong>{new Date(app.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, marginTop: '0.2rem' }}>
                        <Clock size={12} /> {app.timeSlot}
                      </div>
                    </td>
                    <td>
                      <span className="notes-preview" title={app.symptoms}>
                        {app.symptoms || '—'}
                      </span>
                    </td>
                    <td>₹{app.consultationFee}</td>
                    <td>
                      <div className="table-actions">
                        <span className={`status-pill ${app.status}`}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointmentManagement;

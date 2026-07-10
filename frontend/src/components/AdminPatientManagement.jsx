import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import ConfirmModal from './ConfirmModal';
import { Users, Eye, Edit, Trash2, User, UserPlus, Calendar, Ticket } from 'lucide-react';

const EMPTY_PATIENT = {
  name: '', email: '', password: '', phone: '', age: '', gender: 'Male'
};

const AdminPatientManagement = ({ setAlert }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [patientForm, setPatientForm] = useState(EMPTY_PATIENT);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Status toggle confirm
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [toggleData, setToggleData] = useState(null); // { id, isActive, name }

  useEffect(() => {
    fetchPatients();
  }, [page, search, statusFilter]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined
      };
      if (statusFilter !== 'all') {
        params.isActive = statusFilter;
      }
      const res = await adminService.getAllPatients(params);
      setPatients(res.data.patients || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to fetch patients.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setPatientForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.addPatient(patientForm);
      setAlert({ type: 'success', message: `✅ Patient ${patientForm.name} registered successfully!` });
      setShowAddModal(false);
      setPatientForm(EMPTY_PATIENT);
      fetchPatients();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to add patient.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (patient) => {
    setSelectedPatientId(patient._id);
    setPatientForm({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age || '',
      gender: patient.gender || 'Male',
    });
    setShowEditModal(true);
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.updatePatient(selectedPatientId, patientForm);
      setAlert({ type: 'success', message: `✅ Patient ${patientForm.name} updated successfully!` });
      setShowEditModal(false);
      setPatientForm(EMPTY_PATIENT);
      fetchPatients();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update patient.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openProfileModal = async (id) => {
    setProfileLoading(true);
    setShowProfileModal(true);
    try {
      const res = await adminService.getPatientProfile(id);
      setProfileData(res.data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load patient history.' });
      setShowProfileModal(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const openToggleConfirm = (patient) => {
    setToggleData({
      id: patient._id,
      isActive: patient.isActive,
      name: patient.name
    });
    setShowToggleConfirm(true);
  };

  const handleToggleStatus = async () => {
    if (!toggleData) return;
    setActionLoading(true);
    try {
      const nextStatus = !toggleData.isActive;
      await adminService.updatePatient(toggleData.id, { isActive: nextStatus });
      setAlert({ 
        type: 'success', 
        message: `Patient ${toggleData.name} ${nextStatus ? 'activated' : 'deactivated'} successfully!` 
      });
      setShowToggleConfirm(false);
      setToggleData(null);
      fetchPatients();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update patient status.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="patient-management-panel">
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="section-title-icon">
            <Users size={18} style={{ color: 'white' }} />
          </div>
          Patient Directory
        </h2>
        <button className="btn-primary" onClick={() => { setPatientForm(EMPTY_PATIENT); setShowAddModal(true); }}>
          + Add Patient
        </button>
      </div>

      {/* Search and Filters */}
      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="Search by name, email, or phone…" 
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ maxWidth: 360 }}
        />
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ maxWidth: 180 }}
        >
          <option value="all">All Statuses</option>
          <option value="true">Active Patients</option>
          <option value="false">Inactive Patients</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading patients…</div>
      ) : patients.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <Users size={48} style={{ color: 'var(--gray-300)' }} />
          </span>
          <div className="empty-state-title">No patients found</div>
          <p className="empty-state-text">Add a new patient or adjust filters to view listings.</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age/Gender</th>
                  <th>Contact Info</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div className="table-avatar">{p.name.charAt(0).toUpperCase()}</div>
                        <strong>{p.name}</strong>
                      </div>
                    </td>
                    <td>
                      {p.age || '—'} yrs / {p.gender || '—'}
                    </td>
                    <td>
                      <div>{p.email}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{p.phone}</div>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`status-pill ${p.isActive ? 'completed' : 'cancelled'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-secondary-sm" onClick={() => openProfileModal(p._id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={14} /> View Profile
                        </button>
                        <button className="btn-ghost-sm" onClick={() => openEditModal(p)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Edit size={14} /> Edit
                        </button>
                        <button className="btn-ghost-sm danger-text" onClick={() => openToggleConfirm(p)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Trash2 size={14} /> {p.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span>Showing {patients.length} of {total} patients</span>
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} style={{ color: 'var(--primary)' }} /> Register New Patient Account
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddPatient}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="name" value={patientForm.name} onChange={handleInputChange} placeholder="Name" required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={patientForm.email} onChange={handleInputChange} placeholder="email@example.com" required />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input type="password" name="password" value={patientForm.password} onChange={handleInputChange} placeholder="Min. 6 characters" minLength={6} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input name="phone" value={patientForm.phone} onChange={handleInputChange} placeholder="10-digit number" pattern="\d{10}" maxLength={10} required />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input type="number" name="age" value={patientForm.age} onChange={handleInputChange} placeholder="Age" min={0} max={120} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={patientForm.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>Create Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit size={20} style={{ color: 'var(--primary)' }} /> Edit Patient Details
              </div>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdatePatient}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="name" value={patientForm.name} onChange={handleInputChange} placeholder="Name" required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={patientForm.email} onChange={handleInputChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input name="phone" value={patientForm.phone} onChange={handleInputChange} pattern="\d{10}" maxLength={10} required />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input type="number" name="age" value={patientForm.age} onChange={handleInputChange} min={0} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={patientForm.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile / History Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowProfileModal(false); }}>
          <div className="modal" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} style={{ color: 'var(--primary)' }} /> Patient Medical Portfolio
              </div>
              <button className="modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {profileLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading medical history…</div>
              ) : !profileData ? (
                <p>Failed to load profile details.</p>
              ) : (
                <div>
                  {/* Bio details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <div><strong>Name:</strong> {profileData.patient.name}</div>
                    <div><strong>Phone:</strong> {profileData.patient.phone}</div>
                    <div><strong>Email:</strong> {profileData.patient.email}</div>
                    <div><strong>Demographics:</strong> {profileData.patient.age || '—'} yrs / {profileData.patient.gender || '—'}</div>
                  </div>

                  {/* Scheduled Appointments */}
                  <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={18} style={{ color: 'var(--primary)' }} /> Scheduled Appointments ({profileData.appointments.length})
                  </h4>
                  {profileData.appointments.length === 0 ? (
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>No future or past appointments scheduled.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {profileData.appointments.map((app) => (
                        <div key={app._id} style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--gray-100)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                            <span>{app.doctorId?.name} ({app.doctorId?.department})</span>
                            <span className={`status-pill ${app.status}`}>{app.status}</span>
                          </div>
                          <div style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            {new Date(app.appointmentDate).toLocaleDateString('en-IN')} at {app.timeSlot}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Live Queue History */}
                  <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Ticket size={18} style={{ color: 'var(--primary)' }} /> Walk-in Queue Session Logs ({profileData.tokens.length})
                  </h4>
                  {profileData.tokens.length === 0 ? (
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>No today's check-ins logged.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {profileData.tokens.map((tok) => (
                        <div key={tok._id} style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--gray-100)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                            <span>Token #{tok.tokenNumber} — {tok.doctorId?.name}</span>
                            <span className={`status-pill ${tok.status}`}>{tok.status}</span>
                          </div>
                          <div style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                            Queue date: {new Date(tok.date).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-primary" onClick={() => setShowProfileModal(false)}>Close Portfolio</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Deactivation */}
      <ConfirmModal 
        isOpen={showToggleConfirm}
        title={toggleData?.isActive ? 'Deactivate Account?' : 'Activate Account?'}
        message={`Are you sure you want to change status for ${toggleData?.name}? This will affect their login access.`}
        onConfirm={handleToggleStatus}
        onCancel={() => setShowToggleConfirm(false)}
        type="danger"
        confirmText="Confirm Status Update"
      />
    </div>
  );
};

export default AdminPatientManagement;

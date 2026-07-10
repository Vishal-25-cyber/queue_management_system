import React, { useState, useEffect } from 'react';
import { adminService, departmentService } from '../services/api';
import ConfirmModal from './ConfirmModal';
import { Stethoscope, Edit, Trash2 } from 'lucide-react';

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_DOCTOR = {
  name: '', email: '', password: '', phone: '',
  department: '', qualifications: '',
  experience: '', consultationFee: '500', bio: '',
  availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
};

const AdminDoctorManagement = ({ setAlert }) => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Add/Edit Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [doctorForm, setDoctorForm] = useState(EMPTY_DOCTOR);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Deactivate modal confirm
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  useEffect(() => {
    fetchDoctors();
    fetchDepartments();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await adminService.getQueueStatus();
      setDoctors(res.data.queueData || []);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load doctors.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAllDepartments(true);
      setDepartments(res.data.departments || []);
      if (res.data.departments?.length > 0) {
        setDoctorForm(prev => ({ ...prev, department: res.data.departments[0]._id }));
      }
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const handleInputChange = (e) => {
    setDoctorForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvailabilityToggle = (day) => {
    setDoctorForm(prev => {
      const active = prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day];
      return { ...prev, availability: active };
    });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!doctorForm.department) {
      setAlert({ type: 'error', message: 'Please create a department first.' });
      return;
    }
    setActionLoading(true);
    try {
      await adminService.addDoctor(doctorForm);
      setAlert({ type: 'success', message: `✅ Dr. ${doctorForm.name} registered successfully!` });
      setShowAddModal(false);
      setDoctorForm({ ...EMPTY_DOCTOR, department: departments[0]?._id || '' });
      fetchDoctors();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to add doctor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = async (doctor) => {
    setSelectedDoctorId(doctor.doctorId);
    
    // Find the department ID matching the name or ID
    const matchedDept = departments.find(d => d._id.toString() === doctor.department?.toString() || d.name === doctor.department)?._id || '';

    setDoctorForm({
      name: doctor.doctorName,
      email: doctor.email || '',
      phone: doctor.phone || '',
      department: matchedDept,
      qualifications: doctor.qualifications,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      bio: doctor.bio || '',
      availability: doctor.availability || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    });
    setShowEditModal(true);
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.updateDoctor(selectedDoctorId, doctorForm);
      setAlert({ type: 'success', message: `✅ Dr. ${doctorForm.name} profile updated!` });
      setShowEditModal(false);
      fetchDoctors();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update doctor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openDeactivateConfirm = (doctor) => {
    setDeactivateTarget({
      id: doctor.doctorId,
      name: doctor.doctorName
    });
    setShowDeactivateConfirm(true);
  };

  const handleDeactivateDoctor = async () => {
    if (!deactivateTarget) return;
    setActionLoading(true);
    try {
      await adminService.deleteDoctor(deactivateTarget.id);
      setAlert({ type: 'success', message: `Doctor ${deactivateTarget.name} deactivated.` });
      setShowDeactivateConfirm(false);
      setDeactivateTarget(null);
      fetchDoctors();
    } catch (err) {
      setAlert({ type: 'error', message: 'Deactivation failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Filter list
  const filtered = doctors.filter(doc => {
    const matchesSearch = doc.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'all' || doc.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="doctor-management-panel">
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="section-title-icon">
            <Stethoscope size={18} style={{ color: 'white' }} />
          </div>
          Doctor Directory
        </h2>
        <button className="btn-primary" onClick={() => { setDoctorForm({ ...EMPTY_DOCTOR, department: departments[0]?._id || '' }); setShowAddModal(true); }}>
          + Add Doctor
        </button>
      </div>

      {/* Search and Filters */}
      <div className="filter-bar">
        <input 
          type="text" 
          placeholder="Search doctors by name…" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <select 
          value={selectedDept} 
          onChange={(e) => setSelectedDept(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="all">All Departments</option>
          {departments.map(d => (
            <option key={d._id} value={d.name}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading doctor listings…</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <Stethoscope size={48} style={{ color: 'var(--gray-300)' }} />
          </span>
          <div className="empty-state-title">No doctors found</div>
          <p className="empty-state-text">Add a doctor or adjust specialize filters.</p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Department</th>
                  <th>Qualifications</th>
                  <th>Exp / Rating</th>
                  <th>Fee (₹)</th>
                  <th>Duty Hours</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.doctorId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div className="table-avatar blue-avatar" style={{ display: 'flex', alignItems: 'center', justify: 'center' }}>
                          <Stethoscope size={18} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                          <strong>{d.doctorName}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill completed">
                        {departments.find(dept => dept._id.toString() === d.department?.toString() || dept.name === d.department)?.name || d.department}
                      </span>
                    </td>
                    <td>{d.qualifications}</td>
                    <td>
                      <div>{d.experience} years</div>
                      <div style={{ fontSize: '0.8rem', color: '#eab308', fontWeight: 600 }}>⭐ {d.rating?.toFixed(1) || '4.5'}</div>
                    </td>
                    <td><strong>₹{d.consultationFee}</strong></td>
                    <td>
                      <span className="availability-summary" title={d.availability?.join(', ')}>
                        {d.availability?.length === 7 ? 'Daily' : `${d.availability?.length} days/wk`}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-secondary-sm" onClick={() => openEditModal(d)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Edit size={14} /> Edit
                        </button>
                        <button className="btn-ghost-sm danger-text" onClick={() => openDeactivateConfirm(d)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Trash2 size={14} /> Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Stethoscope size={20} style={{ color: 'var(--primary)' }} /> Add New Doctor Profile
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddDoctor}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input name="name" value={doctorForm.name} onChange={handleInputChange} placeholder="Dr. First Last" required />
                  </div>
                  <div className="form-group">
                    <label>Assign Department *</label>
                    <select name="department" value={doctorForm.department} onChange={handleInputChange} required>
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input type="email" name="email" value={doctorForm.email} onChange={handleInputChange} placeholder="doctor@hospital.com" required />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input name="phone" value={doctorForm.phone} onChange={handleInputChange} placeholder="10-digit phone" pattern="\d{10}" maxLength={10} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Account Password *</label>
                    <input type="password" name="password" value={doctorForm.password} onChange={handleInputChange} placeholder="Min. 6 chars" minLength={6} required />
                  </div>
                  <div className="form-group">
                    <label>Qualifications *</label>
                    <input name="qualifications" value={doctorForm.qualifications} onChange={handleInputChange} placeholder="e.g. MBBS, MD (Cardio)" required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Experience (Years) *</label>
                    <input type="number" name="experience" value={doctorForm.experience} onChange={handleInputChange} placeholder="Experience" required />
                  </div>
                  <div className="form-group">
                    <label>Consultation Fee (₹)</label>
                    <input type="number" name="consultationFee" value={doctorForm.consultationFee} onChange={handleInputChange} placeholder="500" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Professional Bio</label>
                  <textarea name="bio" value={doctorForm.bio} onChange={handleInputChange} placeholder="Short bio describing expertise…" rows={2} />
                </div>

                {/* Days selection */}
                <div className="form-group">
                  <label>Weekly Availability Days</label>
                  <div className="availability-days-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {DEFAULT_DAYS.map(day => {
                      const isActive = doctorForm.availability.includes(day);
                      return (
                        <button 
                          type="button" 
                          key={day} 
                          className={`pill-btn ${isActive ? 'active' : ''}`}
                          onClick={() => handleAvailabilityToggle(day)}
                          style={{
                            padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '20px', cursor: 'pointer',
                            background: isActive ? 'var(--primary)' : 'var(--gray-100)',
                            color: isActive ? 'white' : 'var(--gray-600)',
                            border: 'none', transition: 'all 0.15s ease'
                          }}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>Add Doctor Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">✏ Edit Doctor Details</div>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateDoctor}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input name="name" value={doctorForm.name} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Assign Department *</label>
                    <select name="department" value={doctorForm.department} onChange={handleInputChange} required>
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Qualifications *</label>
                    <input name="qualifications" value={doctorForm.qualifications} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Experience (Years) *</label>
                    <input type="number" name="experience" value={doctorForm.experience} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Consultation Fee (₹)</label>
                    <input type="number" name="consultationFee" value={doctorForm.consultationFee} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Phone Contact *</label>
                    <input name="phone" value={doctorForm.phone} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Professional Bio</label>
                  <textarea name="bio" value={doctorForm.bio} onChange={handleInputChange} rows={3} />
                </div>

                {/* Days selection */}
                <div className="form-group">
                  <label>Weekly Availability Days</label>
                  <div className="availability-days-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {DEFAULT_DAYS.map(day => {
                      const isActive = doctorForm.availability.includes(day);
                      return (
                        <button 
                          type="button" 
                          key={day} 
                          className={`pill-btn ${isActive ? 'active' : ''}`}
                          onClick={() => handleAvailabilityToggle(day)}
                          style={{
                            padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '20px', cursor: 'pointer',
                            background: isActive ? 'var(--primary)' : 'var(--gray-100)',
                            color: isActive ? 'white' : 'var(--gray-600)',
                            border: 'none', transition: 'all 0.15s ease'
                          }}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
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

      {/* Deactivation Confirm */}
      <ConfirmModal 
        isOpen={showDeactivateConfirm}
        title="Deactivate Doctor?"
        message={`Are you sure you want to deactivate Dr. ${deactivateTarget?.name}? This will remove them from the active list and disable their account.`}
        onConfirm={handleDeactivateDoctor}
        onCancel={() => setShowDeactivateConfirm(false)}
        type="danger"
        confirmText="Yes, Deactivate"
      />
    </div>
  );
};

export default AdminDoctorManagement;

import React, { useState, useEffect } from 'react';
import { departmentService } from '../services/api';
import ConfirmModal from './ConfirmModal';
import { Building2, Edit, Trash2 } from 'lucide-react';

const EMPTY_DEPT = { name: '', description: '' };

const AdminDepartmentManagement = ({ setAlert }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deptForm, setDeptForm] = useState(EMPTY_DEPT);
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // Delete modal confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchDepartmentStats();
  }, []);

  const fetchDepartmentStats = async () => {
    setLoading(true);
    try {
      const res = await departmentService.getDepartmentStats();
      setDepartments(res.data.stats || []);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load department analytics.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setDeptForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await departmentService.addDepartment(deptForm);
      setAlert({ type: 'success', message: `✅ Department "${deptForm.name}" created!` });
      setShowAddModal(false);
      setDeptForm(EMPTY_DEPT);
      fetchDepartmentStats();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to add department.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (dept) => {
    setSelectedDeptId(dept.departmentId);
    setDeptForm({
      name: dept.name,
      description: dept.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateDept = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await departmentService.updateDepartment(selectedDeptId, deptForm);
      setAlert({ type: 'success', message: `✅ Department "${deptForm.name}" updated successfully!` });
      setShowEditModal(false);
      fetchDepartmentStats();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update department.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteConfirm = (dept) => {
    setDeleteTarget({
      id: dept.departmentId,
      name: dept.name
    });
    setShowDeleteConfirm(true);
  };

  const handleDeleteDept = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await departmentService.deleteDepartment(deleteTarget.id);
      setAlert({ type: 'success', message: `Department "${deleteTarget.name}" deactivated.` });
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchDepartmentStats();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to deactivate department.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="department-management-panel">
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="section-title-icon">
            <Building2 size={18} style={{ color: 'white' }} />
          </div>
          Clinic Departments
        </h2>
        <button className="btn-primary" onClick={() => { setDeptForm(EMPTY_DEPT); setShowAddModal(true); }}>
          + Add Department
        </button>
      </div>

      {/* Grid view of departments with stats */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>Loading department details…</div>
      ) : departments.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <Building2 size={48} style={{ color: 'var(--gray-300)' }} />
          </span>
          <div className="empty-state-title">No departments registered</div>
          <p className="empty-state-text">Create your first clinic department to assign doctors.</p>
        </div>
      ) : (
        <div className="doctors-grid">
          {departments.map((dept) => (
            <div key={dept.departmentId} className="doctor-card department-card">
              <div className="doctor-card-header">
                <div className="doctor-avatar" style={{ display: 'flex', alignItems: 'center', justify: 'center' }}>
                  <Building2 size={24} style={{ color: 'white' }} />
                </div>
                <div>
                  <div className="doctor-card-name">{dept.name}</div>
                  <span className="doctor-card-dept" style={{ color: 'var(--gray-400)', fontWeight: 500 }}>Specialty Unit</span>
                </div>
              </div>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: '1.5', minHeight: '40px', margin: '0.5rem 0' }}>
                {dept.description || 'No description provided.'}
              </p>

              <div className="doctor-card-details" style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <div className="doctor-detail-item">
                  <span className="doctor-detail-label">Assigned Doctors</span>
                  <span className="doctor-detail-value">{dept.totalDoctors} active</span>
                </div>
                <div className="doctor-detail-item">
                  <span className="doctor-detail-label">Unique Patients Today</span>
                  <span className="doctor-detail-value">{dept.totalPatients}</span>
                </div>
                <div className="doctor-detail-item">
                  <span className="doctor-detail-label">Active Queues Today</span>
                  <span className="doctor-detail-value" style={{ color: dept.activeQueues > 0 ? 'var(--warning-dark)' : 'var(--success)', fontWeight: 700 }}>
                    {dept.activeQueues} waiting
                  </span>
                </div>
              </div>

              <div className="doctor-card-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }} onClick={() => openEditModal(dept)}>
                  <Edit size={14} /> Edit Details
                </button>
                <button className="btn-ghost" style={{ padding: '0.5rem 0.75rem', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }} onClick={() => openDeleteConfirm(dept)}>
                  <Trash2 size={14} /> Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} style={{ color: 'var(--primary)' }} /> Create Clinic Specialization
              </div>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddDept}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Department Name *</label>
                  <input name="name" value={deptForm.name} onChange={handleInputChange} placeholder="e.g. Ophthalmology, Oncology" required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={deptForm.description} onChange={handleInputChange} placeholder="Describe types of treatments provided…" rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit size={20} style={{ color: 'var(--primary)' }} /> Edit Department Details
              </div>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateDept}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Department Name *</label>
                  <input name="name" value={deptForm.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={deptForm.description} onChange={handleInputChange} rows={4} />
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

      {/* Deactivate Confirm */}
      <ConfirmModal 
        isOpen={showDeleteConfirm}
        title="Deactivate Department?"
        message={`Are you sure you want to deactivate the "${deleteTarget?.name}" department? This will hide it from the active bookings dropdown.`}
        onConfirm={handleDeleteDept}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
        confirmText="Confirm Deactivate"
      />
    </div>
  );
};

export default AdminDepartmentManagement;

import React, { useState } from 'react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Edit, Lock, Shield } from 'lucide-react';

const PatientProfile = ({ setAlert }) => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age || '',
    gender: user?.gender || 'Male',
    bloodGroup: user?.bloodGroup || '',
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (formData.password) {
      if (!formData.currentPassword) {
        setAlert({ type: 'error', message: 'Current password is required to change password' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setAlert({ type: 'error', message: 'Passwords do not match' });
        return;
      }
    }

    setLoading(true);
    try {
      const data = {
        name: formData.name,
        phone: formData.phone,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup || null
      };

      if (formData.password) {
        data.currentPassword = formData.currentPassword;
        data.password = formData.password;
      }

      const res = await authService.updateProfile(data);
      
      // Update local storage and context user data to persist
      const updatedUser = { ...user, ...res.data.user };
      updateUser(updatedUser);
      
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
      
      // Reset password fields
      setFormData(prev => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }));
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-profile-panel">
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="section-title-icon">
            <User size={18} style={{ color: 'white' }} />
          </div>
          Account Settings
        </h2>
      </div>

      <form onSubmit={handleUpdateProfile} className="profile-grid">
        {/* Left Column: Personal Info Card & Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="dashboard-sub-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
              <User size={20} style={{ color: 'var(--primary-light)' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Personal Information</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Update your contact and demographic details</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email Address (Cannot change)</label>
                <input type="text" value={user?.email || ''} disabled />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} pattern="\d{10}" maxLength={10} required />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} min={0} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ minWidth: 200 }} disabled={loading}>
              {loading ? 'Saving Changes…' : 'Save Profile Changes'}
            </button>
          </div>

          {/* Emergency & Support Helpline Card */}
          <div className="dashboard-sub-card" style={{ borderLeft: '3px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Shield size={16} style={{ color: 'var(--danger-light)' }} />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Emergency & Support</h4>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Need urgent medical attention? Please contact our 24/7 helpline immediately.
            </p>
            <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Emergency Helpline</span>
                <strong style={{ color: 'var(--danger-light)' }}>108 / +91 91100 91100</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Support Email</span>
                <span style={{ color: 'var(--text-primary)' }}>support@mediqueue.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Security Card */}
          <div className="dashboard-sub-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
              <Lock size={20} style={{ color: 'var(--cyan-light)' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Security Settings</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Update your account password securely</p>
              </div>
            </div>

            <div className="form-group">
              <label>Current Password</label>
              <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="Current password" autoComplete="one-time-code" />
            </div>
            <div className="form-group" style={{ marginTop: '0.875rem' }}>
              <label>New Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New password" minLength={6} autoComplete="new-password" />
            </div>
            <div className="form-group" style={{ marginTop: '0.875rem' }}>
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" autoComplete="new-password" />
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.75rem', fontStyle: 'italic' }}>
              * Leave these blank if you do not wish to modify your password.
            </p>
          </div>

          {/* Account Details Summary */}
          <div className="dashboard-sub-card" style={{ borderLeft: '3px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Shield size={16} style={{ color: 'var(--primary-light)' }} />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Account Information</h4>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-item">
                <span className="profile-info-label">Account Role</span>
                <span className="profile-role-badge">{user?.role}</span>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Account Status</span>
                <span className="profile-info-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientProfile;

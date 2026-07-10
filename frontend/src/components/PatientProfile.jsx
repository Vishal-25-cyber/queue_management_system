import React, { useState } from 'react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Edit, Lock } from 'lucide-react';

const PatientProfile = ({ setAlert }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age || '',
    gender: user?.gender || 'Male',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: formData.name,
        phone: formData.phone,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender
      };

      if (formData.password) {
        data.password = formData.password;
      }

      const res = await authService.updateProfile(data);
      
      // Update local storage user data to persist
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
      
      // Reset password fields
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
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

      <div className="dashboard-sub-card" style={{ maxWidth: 640 }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Edit size={18} style={{ color: 'var(--primary)' }} /> Update Personal Details
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>Keep your demographic details and contact info up to date</p>

        <form onSubmit={handleUpdateProfile}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address (Cannot change)</label>
              <input value={user?.email || ''} disabled style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input name="phone" value={formData.phone} onChange={handleChange} pattern="\d{10}" maxLength={10} required />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} min={0} />
            </div>
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <h5 style={{ marginTop: '2rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Lock size={16} style={{ color: 'var(--gray-600)' }} /> Change Password
          </h5>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '1rem' }}>Leave blank if you do not wish to modify your password</p>

          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New password" minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem' }} disabled={loading}>
            {loading ? 'Saving…' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientProfile;

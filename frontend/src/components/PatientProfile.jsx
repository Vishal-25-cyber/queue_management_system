import React, { useState } from 'react';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Shield, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const PatientProfile = ({ setAlert }) => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age || '',
    gender: user?.gender || 'Male',
    bloodGroup: user?.bloodGroup || '',
    specialization: user?.specialization || '',
    consultationFee: user?.consultationFee || '',
  });

  const [pwData, setPwData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });

  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePwChange = (e) => {
    setPwData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Save profile (name, phone, age, gender, bloodGroup) ──
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const data = {
        name: formData.name,
        phone: formData.phone,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender,
        ...(user?.role === 'patient' && { bloodGroup: formData.bloodGroup || null }),
        ...(user?.role === 'doctor' && { specialization: formData.specialization || null }),
        ...(user?.role === 'doctor' && { consultationFee: formData.consultationFee ? Number(formData.consultationFee) : 500 })
      };
      const res = await authService.updateProfile(data);
      const updatedUser = { ...user, ...res.data.user };
      updateUser(updatedUser);
      setAlert({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Change password independently ──
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwData.currentPassword) {
      setAlert({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (!pwData.password || pwData.password.length < 6) {
      setAlert({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (pwData.password !== pwData.confirmPassword) {
      setAlert({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    setPwLoading(true);
    try {
      await authService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        currentPassword: pwData.currentPassword,
        password: pwData.password
      });
      setAlert({ type: 'success', message: 'Password changed successfully!' });
      setPwData({ currentPassword: '', password: '', confirmPassword: '' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to change password. Check your current password.' });
    } finally {
      setPwLoading(false);
    }
  };

  const pwStrength = (() => {
    const p = pwData.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: '#ef4444', w: '25%' };
    if (p.length < 8) return { label: 'Weak', color: '#f59e0b', w: '45%' };
    if (/[A-Z]/.test(p) && /\d/.test(p) && /[^a-zA-Z0-9]/.test(p)) return { label: 'Strong', color: '#22c55e', w: '100%' };
    if (/[A-Z]/.test(p) || /\d/.test(p)) return { label: 'Medium', color: '#06b6d4', w: '70%' };
    return { label: 'Weak', color: '#f59e0b', w: '45%' };
  })();

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

      <div className="profile-grid">
        {/* Left Column: Personal Info Card & Support */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <form onSubmit={handleUpdateProfile}>
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
              {user?.role === 'patient' && (
                <div className="form-group">
                  <label>Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              )}
              {user?.role === 'doctor' && (
                <>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g. Cardiologist" />
                  </div>
                  <div className="form-group">
                    <label>Consultation Fee (₹)</label>
                    <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} min={0} />
                  </div>
                </>
              )}
            </div>

            <button type="submit" className="btn-primary" style={{ minWidth: 200 }} disabled={profileLoading}>
              {profileLoading ? 'Saving Changes…' : 'Save Profile Changes'}
            </button>
          </div>
          </form>

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
          {/* Security Card — independent form */}
          <form onSubmit={handleChangePassword}>
          <div className="dashboard-sub-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
              <KeyRound size={20} style={{ color: 'var(--cyan-light)' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Security Settings</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Update your account password securely</p>
              </div>
            </div>

            {/* Current Password */}
            <div className="form-group">
              <label>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={pwData.currentPassword}
                  onChange={handlePwChange}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                  {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group" style={{ marginTop: '0.875rem' }}>
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw.new ? 'text' : 'password'}
                  name="password"
                  value={pwData.password}
                  onChange={handlePwChange}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  autoComplete="new-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                  {showPw.new ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {pwStrength && (
                <div style={{ marginTop: '0.4rem' }}>
                  <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: pwStrength.w, background: pwStrength.color, borderRadius: 4, transition: 'width 0.3s, background 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.68rem', color: pwStrength.color, fontWeight: 600 }}>{pwStrength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group" style={{ marginTop: '0.875rem' }}>
              <label>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={pwData.confirmPassword}
                  onChange={handlePwChange}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                  {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {pwData.confirmPassword && (
                <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem' }}>
                  {pwData.password === pwData.confirmPassword
                    ? <><CheckCircle2 size={12} style={{ color: '#22c55e' }} /><span style={{ color: '#22c55e' }}>Passwords match</span></>
                    : <><span style={{ color: '#ef4444' }}>✕ Passwords do not match</span></>
                  }
                </div>
              )}
            </div>

            {/* Change Password Button */}
            <button
              type="submit"
              disabled={pwLoading || !pwData.currentPassword || !pwData.password || !pwData.confirmPassword}
              style={{
                marginTop: '1.25rem',
                width: '100%',
                padding: '0.75rem 1rem',
                background: pwLoading || !pwData.currentPassword || !pwData.password || !pwData.confirmPassword
                  ? 'rgba(6,182,212,0.3)'
                  : 'linear-gradient(135deg, #0891b2, #06b6d4)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: pwLoading || !pwData.currentPassword || !pwData.password || !pwData.confirmPassword ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Lock size={15} />
              {pwLoading ? 'Changing Password…' : 'Change Password'}
            </button>
          </div>
          </form>

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
      </div>
    </div>
  );
};

export default PatientProfile;


import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Activity, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import '../styles/AuthPages.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(token, formData.password);
      if (response.data.success) {
        setSuccess('Your password has been successfully reset!');
        setTimeout(() => {
          navigate('/login', { state: { message: 'Password reset successful. Please login with your new password.' } });
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = (() => {
    const p = formData.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: '#ef4444', w: '25%' };
    if (p.length < 8) return { label: 'Weak', color: '#f59e0b', w: '45%' };
    if (/[A-Z]/.test(p) && /\d/.test(p) && /[^a-zA-Z0-9]/.test(p)) return { label: 'Strong', color: '#22c55e', w: '100%' };
    if (/[A-Z]/.test(p) || /\d/.test(p)) return { label: 'Medium', color: '#06b6d4', w: '70%' };
    return { label: 'Weak', color: '#f59e0b', w: '45%' };
  })();

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image-side">
          <div className="auth-grid-overlay"></div>
          <div className="auth-brand-display">
            <div className="auth-brand-card">
              <div className="auth-brand-logo-icon">
                <Activity size={40} />
              </div>
              <div className="auth-brand-logo-text">
                <h1>CareSync</h1>
                <span>Hospital Management</span>
              </div>
            </div>
          </div>
        </div>

        {/* === Right Form Panel === */}
        <div className="auth-form-side">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h2>Reset Password</h2>
              <p>Please enter your new password below.</p>
            </div>

            {success && (
              <div className="auth-alert success">
                <span>✓</span>
                <span>{success} Redirecting to login...</span>
              </div>
            )}

            {error && (
              <div className="auth-alert error">
                <span>✕</span>
                <span>{error}</span>
              </div>
            )}

            {!success && (
              <form className="auth-form" onSubmit={handleSubmit} noValidate>
                {/* New Password */}
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw.new ? 'text' : 'password'}
                      id="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                      style={{ paddingRight: '2.5rem', paddingLeft: '2.5rem' }}
                    />
                    <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw.confirm ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      style={{ paddingRight: '2.5rem', paddingLeft: '2.5rem' }}
                    />
                    <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                      {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {formData.confirmPassword && (
                    <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem' }}>
                      {formData.password === formData.confirmPassword
                        ? <><CheckCircle2 size={12} style={{ color: '#22c55e' }} /><span style={{ color: '#22c55e' }}>Passwords match</span></>
                        : <><span style={{ color: '#ef4444' }}>✕ Passwords do not match</span></>
                      }
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword}
                  className="btn-primary auth-submit-btn"
                  style={{ marginTop: '1.5rem' }}
                >
                  {loading ? (
                    <><span className="btn-spinner" />Resetting Password…</>
                  ) : 'Reset Password'}
                </button>
              </form>
            )}

            <div className="auth-links" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '1.2em' }}>←</span> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

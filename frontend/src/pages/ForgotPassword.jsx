import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { Activity, Mail } from 'lucide-react';
import '../styles/AuthPages.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetUrl, setResetUrl] = useState(''); // For prototype simulation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setResetUrl('');

    try {
      const response = await authService.forgotPassword(email);
      if (response.data.success) {
        setSuccess('Password reset link has been generated!');
        // Simulated email sending: display the link for testing
        if (response.data.resetUrl) {
          setResetUrl(response.data.resetUrl);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

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
              <h2>Forgot Password</h2>
              <p>Enter your email and we'll send you a link to reset your password.</p>
            </div>

            {success && (
              <div className="auth-alert success" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✓</span>
                  <span>{success}</span>
                </div>
                {resetUrl && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                    <strong>Simulated Email Link:</strong><br />
                    <a href={resetUrl} style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>{resetUrl}</a>
                  </div>
                )}
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
                <div className="form-group">
                  <label htmlFor="email">Email address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => { setError(''); setEmail(e.target.value); }}
                      required
                      placeholder="you@example.com"
                      autoComplete="email"
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-primary auth-submit-btn"
                  style={{ marginTop: '1rem' }}
                >
                  {loading ? (
                    <><span className="btn-spinner" />Sending Link…</>
                  ) : 'Send Reset Link'}
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

export default ForgotPassword;

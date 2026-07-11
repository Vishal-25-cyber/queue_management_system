import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Zap, Stethoscope, Ticket, BarChart3, Shield, User } from 'lucide-react';
import '../styles/AuthPages.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('patient');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [success, setSuccess]   = useState(location.state?.message || '');

  const handleChange = (e) => {
    setError('');
    setSuccess('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await login(formData.email, formData.password, selectedRole);

    if (result.success) {
      const role = result.user.role;
      if (role === 'patient') navigate('/patient-dashboard');
      else if (role === 'doctor') navigate('/doctor-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };



  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image-side">
          <div className="auth-brand-display">
            <div className="auth-brand-card">
              <div className="auth-logo-ring">
                <div className="auth-brand-logo-icon">
                  <Activity size={40} />
                </div>
              </div>
              <div className="auth-brand-logo-text">
                <h1>CareSync</h1>
                <span>Hospital Management</span>
              </div>
              <div className="auth-status-badge">
                <div className="status-dot"></div>
                System Online
              </div>
            </div>
          </div>
        </div>

        {/* === Right Form Panel === */}
        <div className="auth-form-side">
          <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {success && (
            <div className="auth-alert success">
              <span>✓</span>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="auth-alert error">
              <span>✕</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Role selector tabs */}
            <div className="form-group">
              <label style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Login As</label>
              <div className="role-tab-container">
                <button
                  type="button"
                  className={`role-tab-btn ${selectedRole === 'patient' ? 'active' : ''}`}
                  onClick={() => { setError(''); setSelectedRole('patient'); }}
                >
                  <User size={16} />
                  <span>Patient</span>
                </button>
                <button
                  type="button"
                  className={`role-tab-btn ${selectedRole === 'doctor' ? 'active' : ''}`}
                  onClick={() => { setError(''); setSelectedRole('doctor'); }}
                >
                  <Stethoscope size={16} />
                  <span>Doctor</span>
                </button>
                <button
                  type="button"
                  className={`role-tab-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => { setError(''); setSelectedRole('admin'); }}
                >
                  <Shield size={16} />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary-light)', textDecoration: 'none', fontWeight: '600' }}>Forgot Password?</Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary auth-submit-btn"
            >
              {loading ? (
                <><span className="btn-spinner" />Signing in…</>
              ) : 'Sign in →'}
            </button>
          </form>

          <div className="auth-links" style={{ marginTop: '2rem' }}>
            Don't have an account? <Link to="/register">Create one here</Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

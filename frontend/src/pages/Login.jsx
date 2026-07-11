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

  const handleQuickLogin = async (email, password, role) => {
    setSelectedRole(role);
    setLoading(true);
    setError('');
    setSuccess('');
    setFormData({ email, password });

    const result = await login(email, password, role);

    if (result.success) {
      const targetRole = result.user.role;
      if (targetRole === 'patient') navigate('/patient-dashboard');
      else if (targetRole === 'doctor') navigate('/doctor-dashboard');
      else if (targetRole === 'admin') navigate('/admin-dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* === Left Image Panel === */}
        <div className="auth-image-side">
          <div className="auth-brand-logo">
            <div className="auth-brand-logo-icon">
              <Activity size={36} />
            </div>
            <div className="auth-brand-logo-text">
              <h1>CareSync</h1>
              <span>Hospital Management</span>
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
              <label htmlFor="password">Password</label>
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

          <div className="auth-links">
            Don't have an account? <Link to="/register">Create one here</Link>
          </div>

          {/* Quick Login Roles */}
          <div className="demo-accounts">
            <h4>Quick Demo Login</h4>
            <div className="demo-grid">
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickLogin('admin@hospital.com', 'Admin@123', 'admin')}
                disabled={loading}
              >
                <Shield size={18} />
                <span>Admin</span>
              </button>

              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickLogin('rajesh.kumar@hospital.com', 'Doctor@123', 'doctor')}
                disabled={loading}
              >
                <Stethoscope size={18} />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickLogin('patient@hospital.com', 'Patient@123', 'patient')}
                disabled={loading}
              >
                <User size={18} />
                <span>Patient</span>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

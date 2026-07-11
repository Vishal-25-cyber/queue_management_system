import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { departmentService } from '../services/api';
import { Shield, Stethoscope, User, Activity } from 'lucide-react';
import '../styles/AuthPages.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient',
    department: '',
    qualifications: '',
    experience: '',
    consultationFee: 500,
    bio: '',
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const response = await departmentService.getAllDepartments(true);
        if (response.data?.success) {
          const depts = response.data.departments || [];
          setDepartments(depts);
          if (depts.length > 0) {
            setFormData(prev => ({ ...prev, department: depts[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      }
    };
    fetchDepts();
  }, []);

  const handleChange = (e) => {
    setError('');
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'doctor') {
      if (!formData.department) {
        setError('Please select a department');
        return;
      }
      if (!formData.qualifications.trim()) {
        setError('Please enter qualifications');
        return;
      }
      if (!formData.experience || Number(formData.experience) <= 0) {
        setError('Please enter a valid experience in years');
        return;
      }
    }

    setLoading(true);
    setError('');

    // Prepare submission data
    const submitData = { ...formData };
    if (formData.role !== 'doctor') {
      delete submitData.department;
      delete submitData.qualifications;
      delete submitData.experience;
      delete submitData.consultationFee;
      delete submitData.bio;
    }

    const result = await register(submitData);

    if (result.success) {
      navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
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
            <h2>Create account</h2>
            <p>Register to get started with CareSync</p>
          </div>

          {/* Role selector */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>I want to register as a:</label>
            <div className="role-tab-container">
              <button
                type="button"
                className={`role-tab-btn ${formData.role === 'patient' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'patient' }))}
              >
                <User size={16} />
                <span>Patient</span>
              </button>
              <button
                type="button"
                className={`role-tab-btn ${formData.role === 'doctor' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'doctor' }))}
              >
                <Stethoscope size={16} />
                <span>Doctor</span>
              </button>
              <button
                type="button"
                className={`role-tab-btn ${formData.role === 'admin' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
              >
                <Shield size={16} />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-alert error">
              <span>✕</span>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Dr. / Mr. / Ms. Your Name"
                autoComplete="name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="10-digit number"
                  pattern="\d{10}"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            {formData.role === 'doctor' && (
              <div className="doctor-fields-container fade-in">
                <h3 className="section-title">Doctor Professional Profile</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="department">Specialized Department</label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      {departments.length === 0 ? (
                        <option value="">No departments available</option>
                      ) : (
                        departments.map(d => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Experience (Years)</label>
                    <input
                      type="number"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 10"
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="qualifications">Qualifications</label>
                    <input
                      type="text"
                      id="qualifications"
                      name="qualifications"
                      value={formData.qualifications}
                      onChange={handleChange}
                      required
                      placeholder="e.g. MBBS, MD (Cardiology)"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="consultationFee">Consultation Fee (₹)</label>
                    <input
                      type="number"
                      id="consultationFee"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                      min="100"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Professional Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about your medical background and focus area..."
                    rows="3"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary auth-submit-btn"
            >
              {loading ? (
                <><span className="btn-spinner" />Creating account…</>
              ) : 'Create account →'}
            </button>
          </form>

          <p className="auth-footer-link">
            Already have an account?
            <Link to="/login">Sign in here</Link>
          </p>

          <p style={{
            marginTop: '1.5rem',
            fontSize: '0.8rem',
            color: 'var(--gray-400)',
            textAlign: 'center',
            lineHeight: '1.6',
          }}>
            By creating an account you agree to our Terms of Service.<br />
            Doctors are added only by the Hospital Administrator.
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

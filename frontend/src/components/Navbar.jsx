import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Calendar, 
  ClipboardList, 
  BarChart3, 
  User, 
  Stethoscope, 
  Settings, 
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import '../styles/Navbar.css';
import { useTheme } from '../context/ThemeContext';

const NAV_LINKS = {
  patient: [],
  doctor: [],
  admin: [],
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const links = user ? (NAV_LINKS[user.role] || []) : [];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="navbar-brand-icon">
            <Activity size={20} style={{ color: 'var(--text-primary)' }} />
          </div>
          <div className="navbar-brand-text">
            <span className="navbar-brand-title">CareSync</span>
            <span className="navbar-brand-sub">Hospital Management</span>
          </div>
        </div>

        {/* Nav Links */}
        {links.length > 0 && (
          <nav className="navbar-links">
            {links.map(link => {
              const LinkIcon = link.icon;
              return (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={e => { e.preventDefault(); navigate(link.to); }}
                  className={`nav-link${location.pathname === link.to ? ' active' : ''}`}
                >
                  <LinkIcon size={16} /> {link.label}
                </a>
              );
            })}
          </nav>
        )}

        {/* Right section */}
        {user && (
          <div className="navbar-right">
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="navbar-user">
              <div className="user-avatar">{initials}</div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-role-text">{user.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

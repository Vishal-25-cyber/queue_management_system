import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HeartPulse, 
  Calendar, 
  ClipboardList, 
  BarChart3, 
  User, 
  Stethoscope, 
  Settings, 
  LogOut 
} from 'lucide-react';
import '../styles/Navbar.css';

const NAV_LINKS = {
  patient: [],
  doctor: [],
  admin:   [
    { to: '/admin-dashboard', label: 'Dashboard', icon: BarChart3 },
  ],
};

const Navbar = () => {
  const { user, logout } = useAuth();
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
            <HeartPulse size={20} style={{ color: 'white' }} />
          </div>
          <div className="navbar-brand-text">
            <span className="navbar-brand-title">MediQueue</span>
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

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  ClipboardList,
  Calendar,
  Users,
  Stethoscope,
  Building2,
  TrendingUp,
  FileText,
  User,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  LayoutDashboard,
  CalendarPlus,
  History
} from 'lucide-react';
import '../styles/Sidebar.css';

const ADMIN_LINKS = [
  { id: 'overview', label: 'Dashboard', icon: BarChart3 },
  { id: 'queue', label: 'Queue Manager', icon: ClipboardList },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'profile', label: 'Profile Settings', icon: User },
];

const PATIENT_LINKS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'book', label: 'Book Appointment', icon: CalendarPlus },
  { id: 'history', label: 'My History', icon: History },
  { id: 'profile', label: 'Profile Settings', icon: User },
];

const DOCTOR_LINKS = [
  { id: 'dashboard',    label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'appointments', label: 'My Appointments',  icon: Calendar },
  { id: 'profile',      label: 'Profile Settings', icon: User },
];

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    localStorage.getItem('sidebar-collapsed') === 'true'
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  let links = PATIENT_LINKS;
  if (user?.role === 'admin') {
    links = ADMIN_LINKS;
  } else if (user?.role === 'doctor') {
    links = DOCTOR_LINKS;
  }

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('theme', nextMode ? 'dark' : 'light');
    if (nextMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  };

  const toggleCollapse = () => {
    const nextCollapsed = !isCollapsed;
    setIsCollapsed(nextCollapsed);
    localStorage.setItem('sidebar-collapsed', String(nextCollapsed));
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="sidebar-mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`sidebar-container ${isCollapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <HeartPulse size={28} className="sidebar-logo-svg" style={{ color: '#22d3ee', flexShrink: 0 }} />
            {!isCollapsed && (
              <div className="sidebar-brand-text">
                <h3>MediQueue</h3>
                <span>Healthcare portal</span>
              </div>
            )}
          </div>
          <button
            className="sidebar-collapse-toggle"
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>


        {/* Links */}
        <nav className="sidebar-nav">
          {links.map((link) => {
            const LinkIcon = link.icon;
            return (
              <button
                key={link.id}
                className={`sidebar-nav-link ${activeTab === link.id ? 'active' : ''}`}
                onClick={() => handleTabClick(link.id)}
                title={isCollapsed ? link.label : undefined}
              >
                <span className="sidebar-nav-icon"><LinkIcon size={20} /></span>
                {!isCollapsed && <span className="sidebar-nav-label">{link.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="sidebar-footer">
          {/* Dark Mode toggle */}
          <button
            className="sidebar-theme-toggle"
            onClick={toggleDarkMode}
            title={isCollapsed ? (darkMode ? 'Light Theme' : 'Dark Theme') : undefined}
          >
            <span className="sidebar-theme-icon">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</span>
            {!isCollapsed && (
              <span className="sidebar-theme-label">
                {darkMode ? 'Light Theme' : 'Dark Theme'}
              </span>
            )}
          </button>

          {/* Logout button */}
          <button
            className="sidebar-logout-btn"
            onClick={logout}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <span className="sidebar-logout-icon"><LogOut size={18} /></span>
            {!isCollapsed && <span className="sidebar-logout-label">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import React from 'react';
import { 
  Users, 
  ClipboardList, 
  Stethoscope, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Activity, 
  PlusCircle
} from 'lucide-react';

const AdminDashboardOverview = ({ stats, queueData, setActiveTab }) => {
  const getWaitTimeText = (mins) => {
    if (!mins) return '—';
    if (mins < 60) return `${mins} mins`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div className="overview-panel">
      {/* Enriched Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Patients Today</span>
            <div className="stat-card-icon blue">
              <Users size={20} style={{ color: '#2563eb' }} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalPatients || 0}</div>
          <p className="stat-card-meta">Registered today</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Active Queues</span>
            <div className="stat-card-icon orange">
              <ClipboardList size={20} style={{ color: '#d97706' }} />
            </div>
          </div>
          <div className="stat-value warning">{stats?.activeQueues || 0}</div>
          <p className="stat-card-meta">Waiting + Called tokens</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Doctors Available</span>
            <div className="stat-card-icon green">
              <Stethoscope size={20} style={{ color: '#059669' }} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalDoctors || 0}</div>
          <p className="stat-card-meta">Practitioners active</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Appointments Today</span>
            <div className="stat-card-icon purple">
              <Calendar size={20} style={{ color: '#7c3aed' }} />
            </div>
          </div>
          <div className="stat-value">{stats?.totalAppointments || 0}</div>
          <p className="stat-card-meta">Scheduled bookings</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Avg. Waiting Time</span>
            <div className="stat-card-icon blue">
              <Clock size={20} style={{ color: '#2563eb' }} />
            </div>
          </div>
          <div className="stat-value">{getWaitTimeText(stats?.averageWaitingTime || 15)}</div>
          <p className="stat-card-meta">Predicted delay per token</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-label">Completed Consults</span>
            <div className="stat-card-icon green">
              <CheckCircle2 size={20} style={{ color: '#059669' }} />
            </div>
          </div>
          <div className="stat-value success">{stats?.completedConsultations || 0}</div>
          <p className="stat-card-meta">Consultations done today</p>
        </div>
      </div>

      {/* Main content splitter */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }} className="mobile-stacked">
        {/* Active Queues Panel */}
        <div className="dashboard-sub-card">
          <div className="dashboard-sub-card-header">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--primary)' }} /> Real-time Queue Tracking
            </h4>
            <button className="btn-ghost-sm" onClick={() => setActiveTab('queue')}>Manage Queues →</button>
          </div>
          <div className="dashboard-sub-card-body">
            {queueData.length === 0 ? (
              <div className="empty-state-sm">
                <p>No active doctor queues at the moment.</p>
              </div>
            ) : (
              <div className="overview-queue-list">
                {queueData.slice(0, 4).map((item) => (
                  <div key={item.doctorId} className="overview-queue-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="overview-queue-avatar">
                        <Stethoscope size={18} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div>
                        <strong>{item.doctorName}</strong>
                        <span className="overview-queue-sub">{item.department?.name || item.department}</span>
                      </div>
                    </div>
                    <div className="overview-queue-stats">
                      <div className="overview-queue-stat-item">
                        <span>Waiting</span>
                        <strong className={item.waitingPatients > 0 ? 'warning-text' : 'success-text'}>
                          {item.waitingPatients}
                        </strong>
                      </div>
                      <div className="overview-queue-stat-item">
                        <span>Called</span>
                        <strong>{item.calledPatients}</strong>
                      </div>
                      <div className="overview-queue-stat-item">
                        <span>Completed</span>
                        <strong className="success-text">{item.completedConsultations}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips / Dashboard Help */}
        <div className="dashboard-sub-card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PlusCircle size={18} style={{ color: 'var(--primary)' }} /> Portal Quick Actions
          </h4>
          <div className="quick-actions-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn-secondary-sm" onClick={() => setActiveTab('appointments')}>Review Pending Bookings</button>
            <button className="btn-secondary-sm" onClick={() => setActiveTab('patients')}>Register New Patient</button>
            <button className="btn-secondary-sm" onClick={() => setActiveTab('doctors')}>Check Doctor Slots</button>
            <button className="btn-secondary-sm" onClick={() => setActiveTab('reports')}>Generate Report CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;

import React from 'react';
import { 
  Users, 
  ClipboardList, 
  Stethoscope, 
  Calendar, 
  Activity
} from 'lucide-react';

const AdminDashboardOverview = ({ stats, queueData, setActiveTab }) => {
  const activeDoctors = queueData.filter(item => 
    item.waitingPatients > 0 || item.calledPatients > 0 || item.completedConsultations > 0
  );

  return (
    <div className="overview-panel">
      {/* Essential Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
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
      </div>

      {/* Main content */}
      <div style={{ marginTop: '2rem' }}>
        {/* Active Queues Panel */}
        <div className="dashboard-sub-card" style={{ width: '100%' }}>
          <div className="dashboard-sub-card-header">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} style={{ color: 'var(--primary)' }} /> Real-time Queue Tracking
            </h4>
            <button className="btn-ghost-sm" onClick={() => setActiveTab('queue')}>Manage Queues →</button>
          </div>
          <div className="dashboard-sub-card-body">
            {activeDoctors.length === 0 ? (
              <div className="empty-state-sm" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No active doctor queues at the moment.</p>
              </div>
            ) : (
              <div className="overview-queue-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {activeDoctors.map((item) => (
                  <div key={item.doctorId} className="overview-queue-item" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div className="overview-queue-avatar" style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', padding: '0.5rem', borderRadius: '8px' }}>
                        <Stethoscope size={20} style={{ color: 'var(--primary-light, #60a5fa)' }} />
                      </div>
                      <div>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{item.doctorName}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.department?.name || item.department}</div>
                      </div>
                    </div>
                    <div className="overview-queue-stats" style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="overview-queue-stat-item" style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Waiting</span>
                        <strong style={{ fontSize: '1.2rem', color: item.waitingPatients > 0 ? 'var(--warning, #f59e0b)' : 'var(--text-primary)' }}>
                          {item.waitingPatients}
                        </strong>
                      </div>
                      <div className="overview-queue-stat-item" style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Called</span>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{item.calledPatients}</strong>
                      </div>
                      <div className="overview-queue-stat-item" style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Completed</span>
                        <strong style={{ fontSize: '1.2rem', color: item.completedConsultations > 0 ? 'var(--success, #10b981)' : 'var(--text-primary)' }}>{item.completedConsultations}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;

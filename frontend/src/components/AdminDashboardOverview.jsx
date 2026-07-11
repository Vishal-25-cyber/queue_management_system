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
    <div className="overview-panel" style={{ animation: 'fadeInUp 0.5s ease' }}>
      {/* Essential Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Patients Stat */}
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.08) 0%, rgba(13, 22, 38, 0.9) 100%)', border: '1px solid rgba(37, 99, 235, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <div className="stat-card-header" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <span className="stat-card-label" style={{ color: '#93c5fd', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: 700 }}>PATIENTS TODAY</span>
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 12px rgba(37,99,235,0.4)', border: 'none', width: '36px', height: '36px', borderRadius: '10px' }}>
              <Users size={18} style={{ color: 'white' }} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '0.5rem', lineHeight: 1 }}>{stats?.totalPatients || 0}</div>
          <p className="stat-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 8px #60a5fa' }}></span> Registered today
          </p>
        </div>

        {/* Queues Stat */}
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(13, 22, 38, 0.9) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <div className="stat-card-header" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <span className="stat-card-label" style={{ color: '#fcd34d', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: 700 }}>ACTIVE QUEUES</span>
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', boxShadow: '0 4px 12px rgba(245,158,11,0.4)', border: 'none', width: '36px', height: '36px', borderRadius: '10px' }}>
              <ClipboardList size={18} style={{ color: 'white' }} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fcd34d', textShadow: '0 2px 10px rgba(245,158,11,0.3)', marginBottom: '0.5rem', lineHeight: 1 }}>{stats?.activeQueues || 0}</div>
          <p className="stat-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }}></span> Waiting + Called
          </p>
        </div>

        {/* Doctors Stat */}
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08) 0%, rgba(13, 22, 38, 0.9) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <div className="stat-card-header" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <span className="stat-card-label" style={{ color: '#6ee7b7', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: 700 }}>DOCTORS AVAIL.</span>
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 12px rgba(16,185,129,0.4)', border: 'none', width: '36px', height: '36px', borderRadius: '10px' }}>
              <Stethoscope size={18} style={{ color: 'white' }} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '0.5rem', lineHeight: 1 }}>{stats?.totalDoctors || 0}</div>
          <p className="stat-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }}></span> Practitioners active
          </p>
        </div>

        {/* Appointments Stat */}
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(124, 58, 237, 0.08) 0%, rgba(13, 22, 38, 0.9) 100%)', border: '1px solid rgba(124, 58, 237, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <div className="stat-card-header" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
            <span className="stat-card-label" style={{ color: '#c4b5fd', letterSpacing: '0.08em', fontSize: '0.75rem', fontWeight: 700 }}>APPOINTMENTS</span>
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', boxShadow: '0 4px 12px rgba(124,58,237,0.4)', border: 'none', width: '36px', height: '36px', borderRadius: '10px' }}>
              <Calendar size={18} style={{ color: 'white' }} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '0.5rem', lineHeight: 1 }}>{stats?.totalAppointments || 0}</div>
          <p className="stat-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', margin: 0, fontSize: '0.8rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 8px #a78bfa' }}></span> Scheduled bookings
          </p>
        </div>
      </div>

      {/* Main content */}
      <div>
        {/* Active Queues Panel */}
        <div className="dashboard-sub-card" style={{ width: '100%', background: 'rgba(13,22,38,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '2rem' }}>
          <div className="dashboard-sub-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: 'white' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={22} style={{ color: 'var(--cyan)' }} />
                <span className="live-pulse-dot" style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', background: 'var(--cyan)', borderRadius: '50%', boxShadow: '0 0 8px var(--cyan)' }}></span>
              </div>
              Real-time Queue Tracking
            </h4>
            <button 
              className="btn-primary" 
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', color: 'var(--cyan-light)', borderRadius: '8px', transition: 'all 0.2s ease', cursor: 'pointer' }} 
              onClick={() => setActiveTab('queue')}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; }}
            >
              Manage Live Queues →
            </button>
          </div>
          
          <div className="dashboard-sub-card-body">
            {activeDoctors.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={24} style={{ color: 'var(--gray-500)' }} />
                </div>
                <div>
                  <h4 style={{ color: 'white', margin: '0 0 0.25rem 0' }}>No Active Queues</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>There are currently no patients waiting or called in any department.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {activeDoctors.map((item) => (
                  <div key={item.doctorId} style={{ position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem', background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }}>
                    
                    {/* Glowing Accent Top Line */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)', opacity: 0.6 }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 10px rgba(6,182,212,0.1)' }}>
                          <Stethoscope size={24} style={{ color: 'var(--cyan-light)' }} />
                        </div>
                        {/* Live indicator dot */}
                        {item.waitingPatients > 0 && (
                          <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', background: '#10b981', border: '2px solid var(--bg-base)', borderRadius: '50%', boxShadow: '0 0 6px #10b981' }}></span>
                        )}
                      </div>
                      <div>
                        <strong style={{ fontSize: '1.15rem', color: 'white', display: 'block', marginBottom: '0.2rem', letterSpacing: '-0.01em', fontWeight: 700 }}>Dr. {item.doctorName.replace('Dr. ', '')}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--cyan-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.2rem 0.5rem', background: 'rgba(6,182,212,0.1)', borderRadius: '4px' }}>
                          {item.department?.name || item.department}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                      
                      {/* Waiting Box */}
                      <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '0.875rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {item.waitingPatients > 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'var(--warning)', opacity: 0.5 }} />}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', fontWeight: 600 }}>Waiting</span>
                        <strong style={{ fontSize: '1.75rem', lineHeight: '1', fontWeight: 800, color: item.waitingPatients > 0 ? '#fbbf24' : 'var(--text-secondary)', textShadow: item.waitingPatients > 0 ? '0 0 10px rgba(251,191,36,0.3)' : 'none' }}>
                          {item.waitingPatients}
                        </strong>
                      </div>
                      
                      {/* Called Box */}
                      <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '0.875rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {item.calledPatients > 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'var(--primary)', opacity: 0.5 }} />}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', fontWeight: 600 }}>Called</span>
                        <strong style={{ fontSize: '1.75rem', lineHeight: '1', fontWeight: 800, color: item.calledPatients > 0 ? '#60a5fa' : 'var(--text-secondary)', textShadow: item.calledPatients > 0 ? '0 0 10px rgba(96,165,250,0.3)' : 'none' }}>
                          {item.calledPatients}
                        </strong>
                      </div>
                      
                      {/* Completed Box */}
                      <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '0.875rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {item.completedConsultations > 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'var(--success)', opacity: 0.5 }} />}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem', fontWeight: 600 }}>Done</span>
                        <strong style={{ fontSize: '1.75rem', lineHeight: '1', fontWeight: 800, color: item.completedConsultations > 0 ? '#34d399' : 'var(--text-secondary)', textShadow: item.completedConsultations > 0 ? '0 0 10px rgba(52,211,153,0.3)' : 'none' }}>
                          {item.completedConsultations}
                        </strong>
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

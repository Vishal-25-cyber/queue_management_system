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
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        {/* Patients Stat */}
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.08) 0%, rgba(13, 22, 38, 0.9) 100%)', border: '1px solid rgba(37, 99, 235, 0.2)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <div className="stat-card-header" style={{ marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <span className="stat-card-label" style={{ color: '#93c5fd', letterSpacing: '0.05em', fontSize: '0.7rem', fontWeight: 700 }}>PATIENTS TODAY</span>
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', border: 'none', width: '30px', height: '30px', borderRadius: '8px' }}>
              <Users size={16} style={{ color: 'white' }} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '0.5rem', lineHeight: 1 }}>{stats?.totalPatients || 0}</div>
          <p className="stat-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', margin: 0, fontSize: '0.75rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 6px #60a5fa' }}></span> Registered today
          </p>
        </div>

        {/* Queues Stat */}
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(13, 22, 38, 0.9) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <div className="stat-card-header" style={{ marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <span className="stat-card-label" style={{ color: '#fcd34d', letterSpacing: '0.05em', fontSize: '0.7rem', fontWeight: 700 }}>ACTIVE QUEUES</span>
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)', border: 'none', width: '30px', height: '30px', borderRadius: '8px' }}>
              <ClipboardList size={16} style={{ color: 'white' }} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fcd34d', textShadow: '0 2px 10px rgba(245,158,11,0.2)', marginBottom: '0.5rem', lineHeight: 1 }}>{stats?.activeQueues || 0}</div>
          <p className="stat-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', margin: 0, fontSize: '0.75rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 6px #fbbf24' }}></span> Waiting + Called
          </p>
        </div>

        {/* Doctors Stat */}
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.08) 0%, rgba(13, 22, 38, 0.9) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <div className="stat-card-header" style={{ marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <span className="stat-card-label" style={{ color: '#6ee7b7', letterSpacing: '0.05em', fontSize: '0.7rem', fontWeight: 700 }}>DOCTORS AVAIL.</span>
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', border: 'none', width: '30px', height: '30px', borderRadius: '8px' }}>
              <Stethoscope size={16} style={{ color: 'white' }} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '0.5rem', lineHeight: 1 }}>{stats?.totalDoctors || 0}</div>
          <p className="stat-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', margin: 0, fontSize: '0.75rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }}></span> Practitioners active
          </p>
        </div>

        {/* Appointments Stat */}
        <div className="stat-card" style={{ background: 'linear-gradient(145deg, rgba(124, 58, 237, 0.08) 0%, rgba(13, 22, 38, 0.9) 100%)', border: '1px solid rgba(124, 58, 237, 0.2)', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <div className="stat-card-header" style={{ marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <span className="stat-card-label" style={{ color: '#c4b5fd', letterSpacing: '0.05em', fontSize: '0.7rem', fontWeight: 700 }}>APPOINTMENTS</span>
            <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)', border: 'none', width: '30px', height: '30px', borderRadius: '8px' }}>
              <Calendar size={16} style={{ color: 'white' }} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)', marginBottom: '0.5rem', lineHeight: 1 }}>{stats?.totalAppointments || 0}</div>
          <p className="stat-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', margin: 0, fontSize: '0.75rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa' }}></span> Scheduled bookings
          </p>
        </div>
      </div>

      {/* Main content */}
      <div>
        {/* Active Queues Panel */}
        <div className="dashboard-sub-card" style={{ width: '100%', background: 'rgba(13,22,38,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
          <div className="dashboard-sub-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', margin: 0, fontWeight: 700, letterSpacing: '-0.01em', color: 'white' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={18} style={{ color: 'var(--cyan)' }} />
                <span className="live-pulse-dot" style={{ position: 'absolute', top: -1, right: -1, width: '6px', height: '6px', background: 'var(--cyan)', borderRadius: '50%', boxShadow: '0 0 6px var(--cyan)' }}></span>
              </div>
              Real-time Queue Tracking
            </h4>
            <button 
              className="btn-primary" 
              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', color: 'var(--cyan-light)', borderRadius: '6px', transition: 'all 0.2s ease', cursor: 'pointer' }} 
              onClick={() => setActiveTab('queue')}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; }}
            >
              Manage Live Queues →
            </button>
          </div>
          
          <div className="dashboard-sub-card-body">
            {activeDoctors.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={20} style={{ color: 'var(--gray-500)' }} />
                </div>
                <div>
                  <h4 style={{ color: 'white', margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>No Active Queues</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>There are currently no patients waiting or called in any department.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {activeDoctors.map((item) => (
                  <div key={item.doctorId} style={{ position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'default' }}>
                    
                    {/* Glowing Accent Top Line */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, var(--cyan), transparent)', opacity: 0.6 }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 10px rgba(6,182,212,0.1)' }}>
                          <Stethoscope size={18} style={{ color: 'var(--cyan-light)' }} />
                        </div>
                        {/* Live indicator dot */}
                        {item.waitingPatients > 0 && (
                          <span style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '10px', height: '10px', background: '#10b981', border: '2px solid var(--bg-base)', borderRadius: '50%', boxShadow: '0 0 4px #10b981' }}></span>
                        )}
                      </div>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: 'white', display: 'block', marginBottom: '0.1rem', letterSpacing: '-0.01em', fontWeight: 700 }}>Dr. {item.doctorName.replace('Dr. ', '')}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--cyan-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.15rem 0.4rem', background: 'rgba(6,182,212,0.1)', borderRadius: '4px' }}>
                          {item.department?.name || item.department}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                      
                      {/* Waiting Box */}
                      <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '0.75rem 0.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {item.waitingPatients > 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'var(--warning)', opacity: 0.5 }} />}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', fontWeight: 600 }}>Waiting</span>
                        <strong style={{ fontSize: '1.35rem', lineHeight: '1', fontWeight: 800, color: item.waitingPatients > 0 ? '#fbbf24' : 'var(--text-secondary)', textShadow: item.waitingPatients > 0 ? '0 0 10px rgba(251,191,36,0.3)' : 'none' }}>
                          {item.waitingPatients}
                        </strong>
                      </div>
                      
                      {/* Called Box */}
                      <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '0.75rem 0.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {item.calledPatients > 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'var(--primary)', opacity: 0.5 }} />}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', fontWeight: 600 }}>Called</span>
                        <strong style={{ fontSize: '1.35rem', lineHeight: '1', fontWeight: 800, color: item.calledPatients > 0 ? '#60a5fa' : 'var(--text-secondary)', textShadow: item.calledPatients > 0 ? '0 0 10px rgba(96,165,250,0.3)' : 'none' }}>
                          {item.calledPatients}
                        </strong>
                      </div>
                      
                      {/* Completed Box */}
                      <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '0.75rem 0.5rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                        {item.completedConsultations > 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'var(--success)', opacity: 0.5 }} />}
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', fontWeight: 600 }}>Done</span>
                        <strong style={{ fontSize: '1.35rem', lineHeight: '1', fontWeight: 800, color: item.completedConsultations > 0 ? '#34d399' : 'var(--text-secondary)', textShadow: item.completedConsultations > 0 ? '0 0 10px rgba(52,211,153,0.3)' : 'none' }}>
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

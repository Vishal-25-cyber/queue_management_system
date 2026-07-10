import React from 'react';
import { Ticket, Bell } from 'lucide-react';

const STATUS_LABELS = {
  waiting: 'Waiting in Line',
  called: 'Called — Please proceed to doctor\'s room',
  'in-consultation': 'In Consultation',
  completed: 'Consultation Completed',
  cancelled: 'Token Cancelled',
  skipped: 'Token Skipped',
};

const PatientQueueTracker = ({ myToken, handleCancel }) => {
  if (!myToken) {
    return (
      <div className="empty-state-card" style={{ padding: '2.5rem 2rem', textAlign: 'center', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
        <Ticket size={48} style={{ color: 'var(--gray-300)' }} />
        <h4 style={{ margin: '0.5rem 0 0.25rem 0', fontWeight: 700 }}>No Active Queue Token</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', maxWidth: '400px', margin: '0 auto' }}>You do not have any active walk-in or checked-in queue tokens for today. Find a doctor below to book a token.</p>
      </div>
    );
  }

  // Calculate predicted waiting time: 15 mins per patient ahead
  const patientsAhead = Math.max(0, myToken.queuePosition - 1);
  const estimatedWait = patientsAhead * 15;

  const getWaitText = (mins) => {
    if (myToken.status === 'called') return 'Called Now';
    if (myToken.status === 'in-consultation') return 'In Progress';
    if (['completed', 'cancelled', 'skipped'].includes(myToken.status)) return '—';
    if (mins === 0) return 'Next in Line';
    if (mins < 60) return `${mins} mins`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div className="token-banner" style={{ background: 'var(--gradient-hero)', borderRadius: 'var(--radius-md)', padding: '2rem', color: 'white', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative Orbs */}
      <div className="auth-brand-orb auth-brand-orb-1" style={{ opacity: 0.15 }} />
      
      <div className="token-banner-inner mobile-stacked" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }}>
        <div>
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Ticket size={14} /> Active Queue Session
          </span>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '1rem', marginBottom: '0.5rem' }}>
            {myToken.doctorId?.name || 'Dr. Practitioner'}
          </h2>
          <span style={{ opacity: 0.8, fontSize: '0.9rem', fontWeight: 600, display: 'block', marginBottom: '1.5rem' }}>
            {myToken.doctorId?.department?.name || myToken.doctorId?.department || 'Specialty Unit'}
          </span>
 
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Queue Status</span>
              <strong style={{ fontSize: '1.1rem' }}>{STATUS_LABELS[myToken.status] || myToken.status}</strong>
            </div>
            {['waiting', 'called'].includes(myToken.status) && (
              <>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Patients Ahead</span>
                  <strong style={{ fontSize: '1.1rem' }}>{patientsAhead}</strong>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Est. Waiting Time</span>
                  <strong style={{ fontSize: '1.1rem' }}>{getWaitText(estimatedWait)}</strong>
                </div>
              </>
            )}
          </div>
 
          {myToken.status === 'called' && (
            <div className="alert alert-pulse" style={{ marginTop: '1.5rem', background: 'rgba(255, 255, 255, 0.15)', border: '1px dashed white', borderRadius: '6px', padding: '0.75rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} className="pulse" />
              <span><strong>Please Proceed!</strong> The doctor is calling your token now.</span>
            </div>
          )}
 
          {['waiting', 'called'].includes(myToken.status) && (
            <button 
              className="btn-danger" 
              style={{ marginTop: '2rem', background: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
              onClick={handleCancel}
            >
              Cancel Queue Token
            </button>
          )}
        </div>
 
        <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1.5rem', borderRadius: '12px', backdropFilter: 'blur(10px)', minWidth: '150px' }}>
          <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>Your Token</span>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1.1, margin: '0.25rem 0' }}>
            {myToken.tokenNumber}
          </div>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>MediQueue System</span>
        </div>
      </div>
    </div>
  );
};
 
export default PatientQueueTracker;

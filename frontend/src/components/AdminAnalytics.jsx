import React from 'react';
import { TrendingUp, BarChart3, Building2 } from 'lucide-react';

const AdminAnalytics = ({ queueData, stats }) => {
  // 1. Data Processing for Doctor Queue Load (Bar Chart)
  const barChartData = queueData.map(d => ({
    label: d.doctorName.split(' ')[1] || d.doctorName,
    value: d.waitingPatients + d.calledPatients
  })).slice(0, 5);

  const maxBarValue = Math.max(...barChartData.map(d => d.value), 5);

  // 2. Real Data for Weekly Consult Trends (Line Chart)
  const lineChartData = stats?.weeklyTrends || [];
  const maxLineValue = Math.max(...lineChartData.map(d => d.value), 1);

  // 3. Data Processing for Department Distribution (Donut Chart)
  const deptCounts = {};
  queueData.forEach(d => {
    const deptName = d.department?.name || d.department || 'Unknown';
    deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
  });
  const donutChartData = Object.keys(deptCounts).map(name => ({
    label: name,
    value: deptCounts[name]
  })).slice(0, 4);
  const totalDeptDoctors = donutChartData.reduce((s, d) => s + d.value, 0) || 1;

  // Donut colors
  const donutColors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="analytics-panel">
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="section-title-icon">
            <TrendingUp size={18} style={{ color: 'white' }} />
          </div>
          Analytics Insights
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="mobile-stacked">
        {/* Bar Chart: Queue Load */}
        <div className="dashboard-sub-card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BarChart3 size={18} style={{ color: 'var(--primary)' }} /> Active Queue Load by Doctor
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>Total active patients in queue today</p>
          {barChartData.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>No active queues today</div>
          ) : (
            <div className="svg-chart-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {barChartData.map((bar, idx) => {
                const widthPercent = (bar.value / maxBarValue) * 100;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '80px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {bar.label}
                    </span>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${widthPercent}%`, background: 'linear-gradient(90deg, var(--primary), var(--cyan))', height: '100%', borderRadius: '8px', transition: 'width 0.5s ease', boxShadow: widthPercent > 0 ? '0 0 10px rgba(37,99,235,0.5)' : 'none' }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, width: '24px', textAlign: 'right', color: 'white' }}>{bar.value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Line Chart: Consultations Trends */}
        <div className="dashboard-sub-card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--success)' }} /> Weekly Consultations Trends
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>Completed patient checks over the week</p>
          <div style={{ height: '180px', position: 'relative' }}>
            <svg viewBox="0 0 400 150" style={{ width: '100%', height: '100%' }}>
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="40" y1="70" x2="380" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <line x1="40" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

              {/* Draw Line Path */}
              <polyline
                fill="none"
                stroke="var(--success)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={lineChartData.map((d, i) => {
                  const x = 40 + i * 55;
                  const y = 120 - (d.value / maxLineValue) * 90;
                  return `${x},${y}`;
                }).join(' ')}
              />

              {/* Data points */}
              {lineChartData.map((d, i) => {
                const x = 40 + i * 55;
                const y = 120 - (d.value / maxLineValue) * 90;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="5" fill="var(--bg-base)" stroke="var(--success)" strokeWidth="2.5" />
                    <text x={x} y="140" fontSize="10" fill="var(--text-secondary)" textAnchor="middle" fontWeight="600">{d.label}</text>
                    <text x={x} y={y - 12} fontSize="10" fill="white" textAnchor="middle" fontWeight="700">{d.value}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Donut Chart: Department Distribution */}
        <div className="dashboard-sub-card">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Building2 size={18} style={{ color: 'var(--primary)' }} /> Practitioner Share by Specialty
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>Doctor allocation across departments</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="mobile-stacked">
            <div style={{ width: '130px', height: '130px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                
                {/* Segments */}
                {(() => {
                  let accumulatedPercent = 0;
                  return donutChartData.map((dept, idx) => {
                    const percent = (dept.value / totalDeptDoctors) * 100;
                    const strokeDasharray = `${percent} ${100 - percent}`;
                    const strokeDashoffset = 100 - accumulatedPercent;
                    accumulatedPercent += percent;

                    return (
                      <circle
                        key={idx}
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        stroke={donutColors[idx % donutColors.length]}
                        strokeWidth="3.5"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      />
                    );
                  });
                })()}
                
                {/* Text Center */}
                <g style={{ transform: 'rotate(90deg) translate(0px, -36px)' }}>
                  <text x="18" y="16" fontSize="5" fontWeight="700" fill="white" textAnchor="middle">
                    {totalDeptDoctors}
                  </text>
                  <text x="18" y="22" fontSize="2.5" fontWeight="600" fill="var(--text-secondary)" textAnchor="middle" style={{ letterSpacing: '0.02em' }}>
                    DOCTORS
                  </text>
                </g>
              </svg>
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {donutChartData.map((dept, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: donutColors[idx % donutColors.length] }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{dept.label}:</span>
                  <span style={{ fontWeight: 700, color: 'white' }}>{dept.value} docs ({Math.round((dept.value / totalDeptDoctors) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;

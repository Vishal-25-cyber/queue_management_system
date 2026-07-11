import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import PrintReport from './PrintReport';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Users, 
  Calendar, 
  ClipboardList, 
  Stethoscope, 
  Eye 
} from 'lucide-react';

const REPORT_TYPES = [
  { id: 'patients', label: 'Patient Summary Report', icon: Users },
  { id: 'appointments', label: 'Appointment Log Report', icon: Calendar },
  { id: 'queues', label: 'Queue Performance Report', icon: ClipboardList },
  { id: 'doctors', label: 'Doctor Efficiency Report', icon: Stethoscope }
];

const AdminReports = ({ setAlert }) => {
  const [activeReport, setActiveReport] = useState('patients');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Print trigger state
  const [printState, setPrintState] = useState(null); // { title, headers, keys, data }

  useEffect(() => {
    fetchReportData(activeReport);
  }, [activeReport]);

  const fetchReportData = async (type) => {
    setLoading(true);
    try {
      let res;
      if (type === 'patients') res = await reportService.getPatientReport();
      else if (type === 'appointments') res = await reportService.getAppointmentReport();
      else if (type === 'queues') res = await reportService.getQueueReport();
      else if (type === 'doctors') res = await reportService.getDoctorReport();

      setReportData(res.data.reportData || []);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to generate report.' });
    } finally {
      setLoading(false);
    }
  };

  const getReportConfig = () => {
    switch (activeReport) {
      case 'patients':
        return {
          title: 'MediQueue - Patients Summary Report',
          headers: ['Patient Name', 'Email', 'Phone Contact', 'Age', 'Gender', 'Status', 'Registered Date', 'Total Appts', 'Total Checkins'],
          keys: ['Name', 'Email', 'Phone', 'Age', 'Gender', 'Status', 'RegisteredDate', 'TotalAppointments', 'TotalTokens']
        };
      case 'appointments':
        return {
          title: 'MediQueue - Appointments Log Report',
          headers: ['Patient Name', 'Assigned Doctor', 'Specialty Unit', 'Appt Date', 'Time Slot', 'Lifecycle Status', 'Consult Fee', 'Payment Status'],
          keys: ['PatientName', 'DoctorName', 'Department', 'AppointmentDate', 'TimeSlot', 'Status', 'Fee', 'Payment']
        };
      case 'queues':
        return {
          title: 'MediQueue - Today\'s Queue Performance Report',
          headers: ['Token No.', 'Patient Name', 'Doctor Name', 'Department', 'Date', 'Queue Status', 'Booked Time', 'Called Time', 'Wait Duration (min)'],
          keys: ['TokenNumber', 'PatientName', 'DoctorName', 'Department', 'Date', 'Status', 'BookedAt', 'CalledAt', 'WaitingTimeMinutes']
        };
      case 'doctors':
        return {
          title: 'MediQueue - Doctor Efficiency Report',
          headers: ['Practitioner', 'Department Specialty', 'Qualifications', 'Exp (Yrs)', 'Fee (₹)', 'Consultations', 'Rating', 'Status'],
          keys: ['Name', 'Department', 'Qualifications', 'ExperienceYears', 'Fee', 'ConsultationsCompleted', 'Rating', 'Status']
        };
      default:
        return { title: '', headers: [], keys: [] };
    }
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    const config = getReportConfig();
    
    // Create CSV rows
    const csvRows = [];
    csvRows.push(config.headers.join(',')); // Add headers

    for (const row of reportData) {
      const values = config.keys.map(key => {
        const val = row[key] !== undefined && row[key] !== null ? String(row[key]) : '';
        const escaped = val.replace(/"/g, '""'); // Escape inner quotes
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeReport}_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setAlert({ type: 'success', message: 'CSV Export completed!' });
  };

  const handlePrintPDF = () => {
    if (reportData.length === 0) return;
    const config = getReportConfig();
    setPrintState({
      title: config.title,
      headers: config.headers,
      keys: config.keys,
      data: reportData
    });
  };

  const config = getReportConfig();

  return (
    <div className="reports-panel">
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="section-title-icon">
            <FileSpreadsheet size={18} style={{ color: 'white' }} />
          </div>
          Reports Generator
        </h2>
        {reportData.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={handleExportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
              <Download size={16} /> Download CSV
            </button>
            <button className="btn-primary" onClick={handlePrintPDF} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
              <Printer size={16} /> Print / PDF
            </button>
          </div>
        )}
      </div>

      <div className="report-type-selector-grid mobile-stacked" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {REPORT_TYPES.map(report => {
          const ReportIcon = report.icon;
          return (
            <button 
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={activeReport === report.id ? 'active-report-btn' : 'inactive-report-btn'}
              style={{ 
                padding: '1.25rem 1rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '0.75rem', 
                background: activeReport === report.id ? 'var(--primary)' : 'rgba(255,255,255,0.02)', 
                border: activeReport === report.id ? '1px solid var(--primary-light)' : '1px solid rgba(255,255,255,0.08)', 
                color: activeReport === report.id ? 'white' : 'var(--text-secondary)', 
                borderRadius: '12px', 
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                boxShadow: activeReport === report.id ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
              }}
            >
              <span style={{ display: 'inline-flex', justifyContent: 'center', padding: '0.35rem', background: activeReport === report.id ? 'rgba(255,255,255,0.2)' : 'rgba(37, 99, 235, 0.1)', borderRadius: '8px' }}>
                <ReportIcon size={24} style={{ color: activeReport === report.id ? 'white' : 'var(--primary-light, #60a5fa)' }} />
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>{report.label}</span>
            </button>
          );
        })}
      </div>

      {/* Table Data Preview */}
      <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Eye size={16} style={{ color: 'var(--primary)' }} /> Report Data Preview ({reportData.length} records)
      </h4>
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>Generating report records…</div>
      ) : reportData.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon" style={{ display: 'inline-flex', justifyContent: 'center' }}>
            <FileSpreadsheet size={48} style={{ color: 'var(--gray-300)' }} />
          </span>
          <div className="empty-state-title">No record logs found</div>
          <p className="empty-state-text">No data logged for the selected query range.</p>
        </div>
      ) : (
        <div className="data-table-wrapper" style={{ maxHeight: '450px', overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {config.headers.map((h, i) => <th key={i}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ color: 'var(--gray-400)', fontWeight: 600 }}>{idx + 1}</td>
                  {config.keys.map((k, i) => (
                    <td key={i}>{String(row[k] !== undefined && row[k] !== null ? row[k] : '—')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Printer Native Container trigger */}
      {printState && (
        <PrintReport 
          title={printState.title}
          headers={printState.headers}
          keys={printState.keys}
          data={printState.data}
          onClose={() => setPrintState(null)}
        />
      )}
    </div>
  );
};

export default AdminReports;

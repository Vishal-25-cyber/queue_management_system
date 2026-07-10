import React, { useEffect } from 'react';
import '../styles/PrintReport.css';

const PrintReport = ({ title, headers, keys, data, onClose }) => {
  useEffect(() => {
    // Wait slightly to ensure rendering completes before print dialog
    const timer = setTimeout(() => {
      window.print();
      onClose();
    }, 800);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="print-report-wrapper">
      <div className="print-report-container">
        <div className="print-report-header">
          <div className="print-brand">
            <span className="print-brand-icon">🏥</span>
            <div className="print-brand-text">
              <h3>MediQueue Hospital Management</h3>
              <span>Executive Data Reports</span>
            </div>
          </div>
          <h2 className="print-report-title">{title}</h2>
          <div className="print-report-meta">
            <span><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN')}</span>
            <span><strong>Record Count:</strong> {data.length} entries</span>
          </div>
        </div>

        <table className="print-report-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              {headers.map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td>{rowIdx + 1}</td>
                {keys.map((key, colIdx) => (
                  <td key={colIdx}>
                    {String(row[key] !== undefined && row[key] !== null ? row[key] : '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-report-footer">
          <p>This document is a system-generated audit report from MediQueue Hospital Management Portal.</p>
          <p className="print-copyright">© {new Date().getFullYear()} MediQueue Hospital. Confidential report.</p>
        </div>
      </div>
    </div>
  );
};

export default PrintReport;

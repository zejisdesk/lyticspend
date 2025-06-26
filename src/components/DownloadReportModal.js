import React, { useState } from 'react';
import { generatePDFReport, generateCSVReport, generateXLSXReport } from '../utils/reportUtils';
import { generateStyledExcelReport } from '../utils/excelExport';
import './DownloadReportModal.css';

const DownloadReportModal = ({ isOpen, onClose, reportData, currency }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  if (!isOpen) return null;
  
  // Check if there are no transactions for the selected month
  const hasNoTransactions = !reportData?.transactions || reportData.transactions.length === 0;
  
  // If there are no transactions, show a message and prevent downloads
  if (hasNoTransactions) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Download Report</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              No transactions available for the selected month. Please select a month with transactions to download a report.
            </div>
          </div>
          <div className="modal-footer">
            <button className="cancel-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const handlePDFDownload = (reportType) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log(`Generating PDF ${reportType} report with data:`, reportData);
      console.log('Currency:', currency);
      
      // Generate printable report with current data and currency code
      const success = generatePDFReport(reportData, currency.code, reportType);
      
      if (!success) {
        setError(`Failed to generate PDF ${reportType} report. Please try again.`);
      } else {
        // Close the modal after a short delay to allow the window to open
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err) {
      console.error(`PDF ${reportType} report generation error:`, err);
      setError(`Failed to generate PDF ${reportType} report. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCSVDownload = (reportType) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log(`Generating CSV ${reportType} report with data:`, reportData);
      console.log('Currency:', currency);
      
      // Generate CSV file with current data
      const success = generateCSVReport(reportData, currency.code, reportType);
      
      if (!success) {
        setError(`Failed to generate CSV ${reportType} report. Please try again.`);
      } else {
        // Close the modal after a short delay
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err) {
      console.error(`CSV ${reportType} report generation error:`, err);
      setError(`Failed to generate CSV ${reportType} report. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleXLSXDownload = async (reportType) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log(`Generating Excel ${reportType} report with data:`, reportData);
      console.log('Currency:', currency);
      
      // Generate Excel file with current data using the new ExcelJS-based function
      const success = await generateStyledExcelReport(reportData, currency.code, reportType);
      
      if (!success) {
        setError(`Failed to generate Excel ${reportType} report. Please try again.`);
      } else {
        // Close the modal after a short delay
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err) {
      console.error(`Excel ${reportType} report generation error:`, err);
      setError(`Failed to generate Excel ${reportType} report. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal-content download-modal">
        <div className="modal-header">
          <h2>Download Report</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        {error && <div className="download-error">{error}</div>}
        
        <div className="download-options">
          <div className="format-options vertical">
            {/* PDF Option */}
            <button 
              className="download-option-btn" 
              onClick={() => handlePDFDownload('full')}
              disabled={isGenerating}
            >
              <i className="fas fa-file-pdf"></i>
              <span>PDF</span>
              <small>Complete financial report</small>
            </button>
            
            {/* CSV Option */}
            <button 
              className="download-option-btn" 
              onClick={() => handleCSVDownload('full')}
              disabled={isGenerating}
            >
              <i className="fas fa-file-csv"></i>
              <span>CSV</span>
              <small>Spreadsheet compatible</small>
            </button>
            
            {/* XLS Option */}
            <button 
              className="download-option-btn" 
              onClick={() => handleXLSXDownload('full')}
              disabled={isGenerating}
            >
              <i className="fas fa-file-excel"></i>
              <span>Excel</span>
              <small>Formatted spreadsheet</small>
            </button>
          </div>
        </div>
        
        <div className="modal-footer">
          {isGenerating && <span className="generating-text">Generating...</span>}
        </div>
      </div>
    </div>
  );
};

export default DownloadReportModal;

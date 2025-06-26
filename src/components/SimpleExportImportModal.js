import React, { useState, useRef } from 'react';
import { downloadAppData, readJSONFile, importAppData } from '../utils/dataExportImport';

const SimpleExportImportModal = ({ onClose }) => {
  const [importStatus, setImportStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleExport = () => {
    console.log("Export button clicked");
    setIsLoading(true);
    try {
      const result = downloadAppData();
      if (result) {
        setImportStatus({
          success: true,
          message: 'Data exported successfully! Your download should begin shortly.'
        });
      } else {
        setImportStatus({
          success: false,
          message: 'Failed to export data. Please try again.'
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      setImportStatus({
        success: false,
        message: `Error exporting data: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportClick = () => {
    console.log("Import button clicked");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    console.log("File selected for import");
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setImportStatus(null);

    try {
      const jsonData = await readJSONFile(file);
      const result = importAppData(jsonData);
      setImportStatus(result);
      
      if (result.success) {
        // Set a timeout to reload the page after showing success message
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus({
        success: false,
        message: `Error importing data: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Simple modal styles
  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  const buttonStyle = {
    padding: '10px 15px',
    margin: '10px 5px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const exportButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#0D6EFD',
    color: 'white'
  };

  const importButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#28A745',
    color: 'white'
  };

  const closeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#DC3545',
    color: 'white'
  };

  const statusStyle = {
    padding: '10px',
    marginTop: '15px',
    borderRadius: '4px'
  };

  const successStyle = {
    ...statusStyle,
    backgroundColor: '#D4EDDA',
    color: '#155724'
  };

  const errorStyle = {
    ...statusStyle,
    backgroundColor: '#F8D7DA',
    color: '#721C24'
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <h2>Export/Import Data</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Export Data</h3>
          <p>
            Export all your LyticSpend data to a JSON file. This includes your transactions, 
            categories, payment methods, budget settings, and preferences.
          </p>
          <button 
            style={exportButtonStyle}
            onClick={handleExport}
            disabled={isLoading}
          >
            {isLoading ? 'Exporting...' : 'Export Data'}
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Import Data</h3>
          <p>
            Import previously exported LyticSpend data. This will replace your current data.
            Make sure to export your current data first if you want to keep it.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />
          <button 
            style={importButtonStyle}
            onClick={handleImportClick}
            disabled={isLoading}
          >
            {isLoading ? 'Importing...' : 'Import Data'}
          </button>
        </div>

        {importStatus && (
          <div style={importStatus.success ? successStyle : errorStyle}>
            <p>{importStatus.message}</p>
            {importStatus.success && importStatus.importedKeys && (
              <p>The app will reload in a few seconds to apply the imported data.</p>
            )}
          </div>
        )}

        <div style={{ textAlign: 'right', marginTop: '20px' }}>
          <button 
            style={closeButtonStyle}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleExportImportModal;

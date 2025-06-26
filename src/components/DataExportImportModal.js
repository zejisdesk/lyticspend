import React, { useState, useRef, useCallback, useEffect } from 'react';
import { downloadAppData, readJSONFile, importAppData } from '../utils/dataExportImport';

const DataExportImportModal = ({ isOpen, onClose }) => {
  const [importStatus, setImportStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Reset status when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, resetting status');
      setImportStatus(null);
    }
  }, [isOpen]);
  
  const handleExport = useCallback(() => {
    console.log('Export button clicked');
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
      console.error('Export error:', error);
      setImportStatus({
        success: false,
        message: `Error exporting data: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleImportClick = useCallback(() => {
    console.log('Import button clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback(async (e) => {
    console.log('File selected for import');
    const file = e.target.files[0];
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
        e.target.value = null;
      }
    }
  }, []);
  
  // Return null if modal is not open
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content data-export-modal">
        <div className="modal-header">
          <h2>Export/Import Data</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">×</button>
        </div>
        
        <div className="modal-body">
          <div className="export-import-section">
            <h3>Export Data</h3>
            <p>
              Export all your LyticSpend data to a JSON file. This includes your transactions, 
              categories, payment methods, budget settings, and preferences.
            </p>
            <button 
              className="export-button"
              onClick={handleExport}
              disabled={isLoading}
              aria-label="Export Data"
            >
              {isLoading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>

          <div className="export-import-section">
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
              aria-label="Import JSON file"
            />
            <button 
              className="import-button"
              onClick={handleImportClick}
              disabled={isLoading}
              aria-label="Import Data"
            >
              {isLoading ? 'Importing...' : 'Import Data'}
            </button>
          </div>

          {importStatus && (
            <div className={`import-status ${importStatus.success ? 'success' : 'error'}`} role="alert">
              <p>{importStatus.message}</p>
              {importStatus.success && importStatus.importedKeys && (
                <p>The app will reload in a few seconds to apply the imported data.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataExportImportModal;

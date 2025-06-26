import React, { useState, useRef } from 'react';

const DirectExportImport = () => {
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);

  // Function to export all data from localStorage
  const handleExport = () => {
    try {
      // Get all keys from localStorage
      const keys = Object.keys(localStorage);
      const exportData = {};
      
      // Add each key-value pair to the export data
      keys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            exportData[key] = JSON.parse(value);
          }
        } catch (e) {
          // If parsing fails, store as string
          exportData[key] = localStorage.getItem(key);
        }
      });
      
      // Add version and timestamp
      exportData._exportVersion = '1.0.0';
      exportData._exportDate = new Date().toISOString();
      
      // Convert to JSON and create blob
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lyticspend-data-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatus('Data exported successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setStatus(`Export failed: ${error.message}`);
    }
  };

  // Function to handle import button click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        
        // Check if this is a valid export
        if (!jsonData._exportVersion) {
          setStatus('Invalid export file. Missing version information.');
          return;
        }
        
        // Import each key into localStorage
        Object.keys(jsonData).forEach(key => {
          // Skip metadata keys
          if (key.startsWith('_export')) return;
          
          try {
            localStorage.setItem(key, JSON.stringify(jsonData[key]));
          } catch (e) {
            console.error(`Failed to import key: ${key}`, e);
          }
        });
        
        setStatus('Data imported successfully! Reloading app...');
        
        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        console.error('Import error:', error);
        setStatus(`Import failed: ${error.message}`);
      }
    };
    
    reader.onerror = () => {
      setStatus('Error reading file');
    };
    
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = '';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Data Export/Import</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Export Data</h3>
        <p>Download all your LyticSpend data as a JSON file</p>
        <button 
          onClick={handleExport}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0D6EFD',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Export All Data
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Import Data</h3>
        <p>Import previously exported LyticSpend data</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          style={{ display: 'none' }}
        />
        <button 
          onClick={handleImportClick}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28A745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Import Data
        </button>
      </div>
      
      {status && (
        <div 
          style={{
            padding: '10px',
            marginTop: '20px',
            backgroundColor: status.includes('failed') ? '#F8D7DA' : '#D4EDDA',
            color: status.includes('failed') ? '#721C24' : '#155724',
            borderRadius: '5px'
          }}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default DirectExportImport;

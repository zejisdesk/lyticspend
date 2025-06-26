/**
 * Utilities for exporting and importing app data
 */

/**
 * Export all app data to a JSON file
 * @returns {Object} The exported data object
 */
export const exportAppData = () => {
  try {
    // Collect all data from localStorage
    const data = {
      version: 1, // For future compatibility
      exportDate: new Date().toISOString(),
      data: {}
    };

    // List of keys to export
    const keysToExport = [
      'transactions',
      'selectedCurrency',
      'darkMode',
      'monthlyBudget',
      'expenseCategories',
      'incomeCategories',
      'expensePaymentMethods',
      'incomePaymentMethods',
      'notifications',
      'reminderTimes'
    ];

    // Get each item from localStorage
    keysToExport.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          // Try to parse as JSON first
          data.data[key] = JSON.parse(item);
        } catch (e) {
          // If not valid JSON, store as string
          data.data[key] = item;
        }
      }
    });

    return data;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
};

/**
 * Download exported data as a JSON file
 */
export const downloadAppData = () => {
  try {
    const data = exportAppData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(dataBlob);
    downloadLink.download = `lyticspend-data-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    return true;
  } catch (error) {
    console.error('Error downloading data:', error);
    return false;
  }
};

/**
 * Import app data from a JSON file
 * @param {Object} jsonData - The parsed JSON data to import
 * @returns {Object} Result of the import operation
 */
export const importAppData = (jsonData) => {
  try {
    // Validate data format
    if (!jsonData || !jsonData.data) {
      throw new Error('Invalid data format');
    }

    // Check version compatibility
    const version = jsonData.version || 1;
    if (version > 1) {
      throw new Error('This data was exported from a newer version of LyticSpend and cannot be imported');
    }

    // Import each data item to localStorage
    const importedKeys = [];
    Object.entries(jsonData.data).forEach(([key, value]) => {
      try {
        // Store strings as is, objects as JSON
        if (typeof value === 'string') {
          localStorage.setItem(key, value);
        } else {
          localStorage.setItem(key, JSON.stringify(value));
        }
        importedKeys.push(key);
      } catch (e) {
        console.error(`Error importing key ${key}:`, e);
      }
    });

    return {
      success: true,
      importedKeys,
      message: `Successfully imported ${importedKeys.length} data items`
    };
  } catch (error) {
    console.error('Error importing data:', error);
    return {
      success: false,
      message: error.message || 'Failed to import data'
    };
  }
};

/**
 * Read a file and parse its contents as JSON
 * @param {File} file - The file to read
 * @returns {Promise<Object>} The parsed JSON data
 */
export const readJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

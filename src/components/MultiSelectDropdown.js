import React, { useState, useRef, useEffect } from 'react';

const MultiSelectDropdown = ({ options, selectedValues = [], onChange, placeholder, label, id, required, items = null, iconProperty = 'icon', showFooter = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // If items are provided (for categories or payment methods with icons)
  const hasItems = items !== null;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  // Handle option selection/deselection
  const handleSelect = (option) => {
    let newSelectedValues;
    
    if (selectedValues.includes(option)) {
      // Remove option if already selected
      newSelectedValues = selectedValues.filter(val => val !== option);
    } else {
      // Add option if not already selected
      newSelectedValues = [...selectedValues, option];
    }
    
    onChange(newSelectedValues);
    // Don't close dropdown after selection to allow multiple selections
  };

  // Display text for selected values
  const getDisplayText = () => {
    if (selectedValues.length === 0) {
      return placeholder;
    } else if (selectedValues.length === 1) {
      return selectedValues[0];
    } else if (selectedValues.length === options.length) {
      return 'All Selected';
    } else {
      return `${selectedValues.length} Selected`;
    }
  };

  return (
    <div className="custom-dropdown-container multi-select-dropdown" ref={dropdownRef}>
      <label htmlFor={id}>{label}</label>
      <div 
        className={`custom-dropdown-selected ${selectedValues.length === 0 ? 'placeholder' : ''}`}
        onClick={toggleDropdown}
      >
        <span>{getDisplayText()}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </div>
      
      {isOpen && (
        <div className="custom-dropdown-menu">
          <div className="custom-dropdown-search">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="custom-dropdown-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const item = hasItems ? items.find(item => item.name === option) : null;
                const icon = item ? item[iconProperty] : null;
                const isSelected = selectedValues.includes(option);
                
                return (
                  <div 
                    key={index} 
                    className={`custom-dropdown-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="option-content">
                      {icon && <i className={`fas ${icon}`}></i>}
                      <span>{option}</span>
                    </div>
                    {isSelected && <i className="fas fa-check check-icon"></i>}
                  </div>
                );
              })
            ) : (
              <div className="custom-dropdown-no-results">No results found</div>
            )}
          </div>
          <div className="multi-select-actions">
            <button 
              className="select-all-btn"
              onClick={(e) => {
                e.stopPropagation();
                onChange(options);
              }}
            >
              Select All
            </button>
            <button 
              className="clear-all-btn"
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
            >
              Clear
            </button>
          </div>
          {showFooter && (
            <div 
              className="custom-dropdown-footer" 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                window.location.href = '#/settings';
              }}
            >
              Go to <span className="settings-link">settings</span> to customize
            </div>
          )}
        </div>
      )}
      
      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          id={id}
          value={selectedValues.join(',')}
          required
          style={{ display: 'none' }}
          onChange={() => {}}
        />
      )}
    </div>
  );
};

export default MultiSelectDropdown;

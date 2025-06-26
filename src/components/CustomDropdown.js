import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({ options, value, onChange, placeholder, label, id, required, items = null, iconProperty = 'icon', showFooter = true }) => {
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

  // We intentionally don't auto-focus the search input when dropdown opens
  // This prevents mobile keyboard from automatically appearing

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  // Handle option selection
  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <label htmlFor={id}>{label}</label>
      <div 
        className={`custom-dropdown-selected ${!value ? 'placeholder' : ''}`}
        onClick={toggleDropdown}
      >
        {hasItems && value ? (
          <div className="dropdown-selected-with-icon">
            <i className={`fas ${items.find(item => item.name === value)?.[iconProperty] || 'fa-circle'}`}></i>
            <span>{value}</span>
          </div>
        ) : (
          value || placeholder
        )}
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
                
                return (
                  <div 
                    key={index} 
                    className={`custom-dropdown-option ${value === option ? 'selected' : ''}`}
                    onClick={() => handleSelect(option)}
                  >
                    {icon && <i className={`fas ${icon}`}></i>}
                    <span>{option}</span>
                  </div>
                );
              })
            ) : (
              <div className="custom-dropdown-no-results">No results found</div>
            )}
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
          value={value}
          required
          style={{ display: 'none' }}
          onChange={() => {}}
        />
      )}
    </div>
  );
};

export default CustomDropdown;

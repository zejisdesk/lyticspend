import React, { useState, useEffect, useRef } from 'react';

/**
 * Month Year Picker component for filtering transactions by month and year
 * @param {Object} props - Component props
 * @param {string} props.selectedMonthYear - Currently selected month and year (format: "June 2025")
 * @param {Function} props.onMonthYearChange - Callback when month/year is changed
 * @returns {JSX.Element} Month Year Picker component
 */
const MonthYearPicker = ({ selectedMonthYear, onMonthYearChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableMonths, setAvailableMonths] = useState([]);
  const dropdownRef = useRef(null);

  // Generate available months (current month and 23 months back)
  useEffect(() => {
    const months = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Generate last 24 months (including current)
    for (let i = 0; i < 24; i++) {
      const monthOffset = currentMonth - i;
      const yearOffset = Math.floor(monthOffset / 12);
      
      const month = monthOffset >= 0 ? monthOffset : 12 + monthOffset;
      const year = currentYear + yearOffset;
      
      const date = new Date(year, month);
      const monthYearString = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      months.push({
        value: monthYearString,
        month,
        year,
        label: monthYearString
      });
    }

    setAvailableMonths(months);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle month selection
  const handleMonthSelect = (monthYear) => {
    onMonthYearChange(monthYear);
    setIsOpen(false);
  };

  return (
    <div className="month-year-picker" ref={dropdownRef}>
      <button 
        className="month-year-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedMonthYear}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>
      
      {isOpen && (
        <div className="month-year-dropdown">
          {availableMonths.map((item) => (
            <div 
              key={item.value}
              className={`month-year-option ${selectedMonthYear === item.value ? 'selected' : ''}`}
              onClick={() => handleMonthSelect(item.value)}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthYearPicker;

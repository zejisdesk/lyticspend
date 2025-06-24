import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';

const InitialCurrencyModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState([]);
  const { currency, updateCurrency, currencies } = useCurrency();

  // Initialize filteredCurrencies when component mounts, sorted alphabetically by currency name
  useEffect(() => {
    const sortedCurrencies = Object.keys(currencies).sort((a, b) => 
      currencies[a].name.localeCompare(currencies[b].name)
    );
    setFilteredCurrencies(sortedCurrencies);
  }, [currencies]);
  
  // Filter currencies based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      const sortedCurrencies = Object.keys(currencies).sort((a, b) => 
        currencies[a].name.localeCompare(currencies[b].name)
      );
      setFilteredCurrencies(sortedCurrencies);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = Object.keys(currencies).filter(code => {
        const currencyData = currencies[code];
        return (
          code.toLowerCase().includes(query) ||
          currencyData.name.toLowerCase().includes(query) ||
          currencyData.symbol.toLowerCase().includes(query)
        );
      });
      // Sort the filtered results alphabetically by name
      filtered.sort((a, b) => currencies[a].name.localeCompare(currencies[b].name));
      setFilteredCurrencies(filtered);
    }
  }, [searchQuery, currencies]);

  // Handler for selecting a currency
  const handleCurrencySelect = (currencyCode) => {
    updateCurrency(currencyCode);
    onClose();
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay initial-currency-overlay">
      <div className="modal-content currency-modal">
        <div className="modal-header">
          <h3>Select Your Currency</h3>
        </div>
        <div className="modal-body">
          <p className="currency-intro">Please select your preferred currency to get started:</p>
          <div className="currency-search-container">
            <div className="currency-search-input-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                className="currency-search-input"
                placeholder="Search currencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search-button"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>
          <div className="currency-list">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((code) => (
                <div 
                  key={code} 
                  className={`currency-item ${currency.code === code ? 'selected' : ''}`}
                  onClick={() => handleCurrencySelect(code)}
                >
                  <div className="currency-symbol">{currencies[code].symbol}</div>
                  <div className="currency-details">
                    <div className="currency-name">{currencies[code].name}</div>
                    <div className="currency-code">{code}</div>
                  </div>
                  {currency.code === code && (
                    <div className="currency-selected">
                      <i className="fas fa-check"></i>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results">No currencies found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialCurrencyModal;

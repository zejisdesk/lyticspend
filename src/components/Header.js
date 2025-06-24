import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { getCurrentMonthYear } from '../utils/financialUtils';

const Header = ({ income, expenses, balance, activeTab, transactions }) => {
  const currentMonth = getCurrentMonthYear();
  const { currency } = useCurrency();
  
  // Only render the summary card for the expenses tab
  const shouldShowSummary = activeTab === 'expenses';
  
  return (
    <div className="header">
      <div className="header-title">
        <div className="app-title">
          <img src="/app_logo.svg" alt="Lytic Spend Logo" className="app-logo" />
          <h1>Lyticspend</h1>
        </div>
        <p className="month-display">{currentMonth}</p>
      </div>
      
      {shouldShowSummary && (
        <div className="summary-card">
          <div className="summary-section">
            <div className="summary-row">
              <p className="summary-label">Income:</p>
              <p className="summary-amount income">{currency.symbol}{income.toFixed(2)}</p>
            </div>
          </div>
          <div className="summary-section">
            <div className="summary-row">
              <p className="summary-label">Expenses:</p>
              <p className="summary-amount expense">-{currency.symbol}{Math.abs(expenses).toFixed(2)}</p>
            </div>
          </div>
          <div className="summary-section">
            <div className="summary-row">
              <p className="summary-label">Balance:</p>
              <p className="summary-amount">{currency.symbol}{balance.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;

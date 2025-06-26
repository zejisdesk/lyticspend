import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import MonthYearPicker from './MonthYearPicker';

const Header = ({ income, expenses, balance, activeTab, transactions, selectedMonthYear, onMonthYearChange }) => {
  const { currency } = useCurrency();
  
  // Filter transactions for the selected month-year
  const { filterTransactionsByMonthYear } = require('../utils/financialUtils');
  const monthFilteredTransactions = filterTransactionsByMonthYear(transactions, selectedMonthYear);
  
  // Only render the summary card for the expenses tab and when there are transactions for the selected month
  const hasTransactionsForSelectedMonth = monthFilteredTransactions.length > 0;
  const shouldShowSummary = activeTab === 'expenses';
  
  return (
    <div className="header">
      <div className="header-title">
        <div className="app-title">
          <img src={process.env.PUBLIC_URL + '/app_logo.svg'} alt="Lytic Spend Logo" className="app-logo" />
          <h1>Lyticspend</h1>
        </div>
        {activeTab !== 'settings' && (
          <MonthYearPicker 
            selectedMonthYear={selectedMonthYear}
            onMonthYearChange={onMonthYearChange}
          />
        )}
      </div>
      
      {shouldShowSummary && hasTransactionsForSelectedMonth ? (
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
      ) : shouldShowSummary ? (
        <div className="summary-card no-transactions-summary">
          <div className="empty-month-message">
            <p>No transactions for {selectedMonthYear}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Header;

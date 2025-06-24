import React from 'react';

const ActionButtons = ({ onAddExpense, onAddIncome }) => {
  return (
    <div className="action-buttons" style={{ marginTop: '0.5rem', padding: '0 0.5rem' }}>
      <button className="add-expense-btn" onClick={onAddExpense}>
        <i className="fas fa-plus btn-icon"></i> Add Expense
      </button>
      <button className="add-income-btn" onClick={onAddIncome}>
        <i className="fas fa-plus btn-icon"></i> Add Income
      </button>
    </div>
  );
};

export default ActionButtons;

import React, { useContext } from 'react';
import { CurrencyContext } from '../context/CurrencyContext';

const Analysis = ({ transactions }) => {
  const { currency } = useContext(CurrencyContext);

  return (
    <div className="analysis-container">
      <h2>Analyzing Your Spending</h2>
      
      <div className="analysis-section">
        <h3>Spending Insights</h3>
        <p>This section will provide detailed analysis of your spending patterns.</p>
        
        <div className="placeholder-content">
          <div className="placeholder-item">
            <i className="fas fa-chart-pie placeholder-icon"></i>
            <p>Category breakdown analysis will appear here</p>
          </div>
          
          <div className="placeholder-item">
            <i className="fas fa-chart-line placeholder-icon"></i>
            <p>Spending trends over time will appear here</p>
          </div>
          
          <div className="placeholder-item">
            <i className="fas fa-lightbulb placeholder-icon"></i>
            <p>Spending recommendations will appear here</p>
          </div>
        </div>
      </div>
      
      <div className="analysis-section">
        <h3>Coming Soon</h3>
        <ul className="feature-list">
          <li><i className="fas fa-check-circle"></i> Category spending breakdown</li>
          <li><i className="fas fa-check-circle"></i> Monthly comparison charts</li>
          <li><i className="fas fa-check-circle"></i> Spending anomaly detection</li>
          <li><i className="fas fa-check-circle"></i> Budget optimization suggestions</li>
          <li><i className="fas fa-check-circle"></i> Recurring expense identification</li>
        </ul>
      </div>
    </div>
  );
};

export default Analysis;

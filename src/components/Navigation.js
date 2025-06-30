import React from 'react';

const Navigation = ({ activeTab, onTabChange }) => {
  return (
    <nav className="navigation">
      <div 
        className={`nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
        onClick={() => onTabChange('expenses')}
      >
        <div className="nav-icon"><i className="fas fa-chart-bar"></i></div>
        <div className="nav-label">Expenses</div>
      </div>
      
      <div 
        className={`nav-item ${activeTab === 'income' ? 'active' : ''}`}
        onClick={() => onTabChange('income')}
      >
        <div className="nav-icon"><i className="fas fa-wallet"></i></div>
        <div className="nav-label">Income</div>
      </div>
      
      <div 
        className={`nav-item ${activeTab === 'analysis' ? 'active' : ''}`}
        onClick={() => onTabChange('analysis')}
      >
        <div className="nav-icon"><i className="fas fa-search-dollar"></i></div>
        <div className="nav-label">Analysis</div>
      </div>
      
      <div 
        className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
        onClick={() => onTabChange('reports')}
      >
        <div className="nav-icon"><i className="fas fa-chart-line"></i></div>
        <div className="nav-label">Reports</div>
      </div>
      
      <div 
        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onTabChange('settings')}
      >
        <div className="nav-icon"><i className="fas fa-cog"></i></div>
        <div className="nav-label">Settings</div>
      </div>
    </nav>
  );
};

export default Navigation;

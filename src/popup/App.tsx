import React, { useState, useEffect } from 'react';
import './App.css';

const App: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [stats, setStats] = useState({
    todayCount: 0,
    totalCount: 0,
    pagesCount: 0
  });

  useEffect(() => {
    // Load initial state from storage
    chrome.storage.local.get(['enabled', 'stats'], (result) => {
      if (result.enabled !== undefined) {
        setEnabled(result.enabled);
      }
      if (result.stats) {
        setStats(result.stats);
      }
    });
  }, []);

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);

    // Save to storage
    chrome.storage.local.set({ enabled: newEnabled });

    // Send message to background script
    chrome.runtime.sendMessage({ action: 'toggleAdBlocking', enabled: newEnabled });
  };

  return (
    <div className="container">
      <div className="header">
        <img src="../assets/icon48.png" alt="AdBlocker Logo" className="logo" />
        <h1>AdBlocker Extension</h1>
      </div>

      <div className="toggle-container">
        <span>Ad Blocking</span>
        <label className="toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="stats">
        <div className="stat-item">
          <span>Ads Blocked Today:</span>
          <span>{stats.todayCount}</span>
        </div>
        <div className="stat-item">
          <span>Total Ads Blocked:</span>
          <span>{stats.totalCount}</span>
        </div>
        <div className="stat-item">
          <span>Pages Protected:</span>
          <span>{stats.pagesCount}</span>
        </div>
      </div>

      <div className="footer">
        <p>AdBlocker Extension v1.0.0</p>
      </div>
    </div>
  );
};

export default App;

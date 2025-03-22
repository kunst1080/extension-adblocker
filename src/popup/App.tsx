import React, { useState, useEffect } from "react";
import "./App.css";

const App: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [stats, setStats] = useState({
    todayCount: 0,
    totalCount: 0,
  });

  useEffect(() => {
    // Load initial state from storage and get stats from background
    chrome.storage.local.get(["enabled"], (result) => {
      if (result.enabled !== undefined) {
        setEnabled(result.enabled);
      }
    });

    // Get stats from background script
    chrome.runtime.sendMessage({ action: "getStats" }, (response) => {
      if (response && response.stats) {
        setStats(response.stats);
      }
    });

    // Listen for changes to storage
    const storageListener = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.enabled) {
        setEnabled(changes.enabled.newValue);
      }
      if (changes.stats) {
        setStats(changes.stats.newValue);
      }
    };

    // Add the listener
    chrome.storage.onChanged.addListener(storageListener);

    // Clean up the listener when the component unmounts
    return () => {
      chrome.storage.onChanged.removeListener(storageListener);
    };
  }, []);

  const handleToggle = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);

    // Save to storage
    chrome.storage.local.set({ enabled: newEnabled });

    // Send message to background script
    chrome.runtime.sendMessage({
      action: "toggleAdBlocking",
      enabled: newEnabled,
    });
  };

  return (
    <div className="container">
      <div className="header">
        <img src="/icon48.svg" alt="AdBlocker Logo" className="logo" />
        <h1>AdBlocker Extension</h1>
      </div>
      <div className="toggle-container">
        <span>Ad Blocking</span>
        <label className="toggle">
          <input type="checkbox" checked={enabled} onChange={handleToggle} />
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
      </div>
      <div className="footer">
        <p>AdBlocker Extension v1.0.0</p>
      </div>
    </div>
  );
};

export default App;

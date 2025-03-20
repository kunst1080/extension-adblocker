// Ad blocking rules
const adBlockRules = [
  // Common ad domains and patterns
  '*://*.doubleclick.net/*',
  '*://*.googlesyndication.com/*',
  '*://*.googleadservices.com/*',
  '*://*.google-analytics.com/*',
  '*://*.adnxs.com/*',
  '*://*.advertising.com/*',
  '*://ads.*.com/*',
  '*://ad.*.com/*',
  '*://banner.*.com/*',
  '*://banners.*.com/*',
];

// Statistics
interface Stats {
  todayCount: number;
  totalCount: number;
  pagesCount: number;
  lastResetDate: string;
}

// Default stats
const defaultStats: Stats = {
  todayCount: 0,
  totalCount: 0,
  pagesCount: 0,
  lastResetDate: new Date().toDateString()
};

// Extension state
let enabled = true;
let stats = { ...defaultStats };
let activeListeners: any[] = [];

// Function to reset daily stats if needed
function checkAndResetDailyStats() {
  const today = new Date().toDateString();
  if (stats.lastResetDate !== today) {
    stats.todayCount = 0;
    stats.lastResetDate = today;
    saveStats();
  }
}

// Function to save stats to storage
function saveStats() {
  chrome.storage.local.set({ stats });
}

// Function to update stats when an ad is blocked
function updateStats(details: chrome.webRequest.WebRequestDetails) {
  // Increment counters
  stats.todayCount++;
  stats.totalCount++;

  // Track unique pages
  const tabId = details.tabId;
  if (tabId > 0) {
    // Only count actual tabs, not the background
    chrome.tabs.get(tabId, (tab) => {
      if (tab && tab.url) {
        // Could implement more sophisticated tracking of unique pages here
        stats.pagesCount++;
        saveStats();
      }
    });
  }

  saveStats();
}

// Function to set up ad blocking
function setupAdBlocking() {
  // Remove any existing listeners
  if (activeListeners.length > 0) {
    for (const listener of activeListeners) {
      chrome.webRequest.onBeforeRequest.removeListener(listener);
    }
    activeListeners = [];
  }

  if (enabled) {
    // Create a new listener function
    const listener = (details: chrome.webRequest.WebRequestDetails) => {
      updateStats(details);
      return { cancel: true };
    };

    // Add the listener
    chrome.webRequest.onBeforeRequest.addListener(
      listener,
      { urls: adBlockRules },
      ['blocking']
    );

    // Store the listener reference
    activeListeners.push(listener);
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'toggleAdBlocking') {
    enabled = message.enabled;
    chrome.storage.local.set({ enabled });
    setupAdBlocking();
    sendResponse({ success: true });
  } else if (message.action === 'getStats') {
    sendResponse({ stats });
  }
  return true; // Keep the message channel open for async responses
});

// Initialize the extension
function init() {
  console.log('AdBlocker Extension initialized');

  // Load settings from storage
  chrome.storage.local.get(['enabled', 'stats'], (result) => {
    if (result.enabled !== undefined) {
      enabled = result.enabled;
    }

    if (result.stats) {
      stats = result.stats;
    }

    checkAndResetDailyStats();
    setupAdBlocking();
  });
}

// Start the extension
init();

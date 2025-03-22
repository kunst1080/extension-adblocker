// Ad blocking rules patterns
const adDomainPatterns = [
  "*://*.doubleclick.net/*",
  "*://*.googlesyndication.com/*",
  "*://*.googleadservices.com/*",
  "*://*.google-analytics.com/*",
  "*://*.adnxs.com/*",
  "*://*.advertising.com/*",
  "*://ads.*.com/*",
  "*://ad.*.com/*",
  "*://banner.*.com/*",
  "*://banners.*.com/*",
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
  lastResetDate: new Date().toDateString(),
};

// Extension state
let enabled = true;
let stats = { ...defaultStats };
let ruleIds: number[] = [];
let navigationListener: ((details: any) => void) | null = null;
// Set to track unique domains where ads have been blocked
const uniqueDomains = new Set<string>();

// Function to reset daily stats if needed
function checkAndResetDailyStats() {
  const today = new Date().toDateString();
  if (stats.lastResetDate !== today) {
    stats.todayCount = 0;
    stats.lastResetDate = today;

    // We don't reset uniqueDomains here because pagesCount is a cumulative stat
    // If we wanted to track daily unique domains, we would need a separate counter

    saveStats();
  }
}

// Function to save stats and domains to storage
function saveStats() {
  // Convert Set to Array for storage
  const domainsArray = Array.from(uniqueDomains);
  chrome.storage.local.set({
    stats,
    uniqueDomains: domainsArray,
  });
}

// Define a type for navigation details
interface NavigationDetails {
  url?: string;
  tabId?: number;
}

// Function to update stats when an ad is blocked
function updateStats(details: NavigationDetails) {
  // Increment counters
  stats.todayCount++;
  stats.totalCount++;

  // Track unique domains
  if (details.url) {
    try {
      // Extract domain from URL
      const url = new URL(details.url);
      const domain = url.hostname;

      // Only count unique domains
      if (!uniqueDomains.has(domain)) {
        uniqueDomains.add(domain);
        stats.pagesCount = uniqueDomains.size; // Update count to match the set size
      }

      saveStats();
    } catch (e) {
      // Invalid URL, just save the stats without updating pages
      saveStats();
    }
  } else {
    // No URL available, just save the stats without updating pages
    saveStats();
  }
}

// Convert ad domain patterns to declarativeNetRequest rules
function createRules(): chrome.declarativeNetRequest.Rule[] {
  return adDomainPatterns.map((pattern, index) => {
    return {
      id: index + 1, // Rule IDs must be positive integers
      priority: 1,
      action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
      condition: {
        urlFilter: pattern,
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
          chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
          chrome.declarativeNetRequest.ResourceType.STYLESHEET,
          chrome.declarativeNetRequest.ResourceType.SCRIPT,
          chrome.declarativeNetRequest.ResourceType.IMAGE,
          chrome.declarativeNetRequest.ResourceType.FONT,
          chrome.declarativeNetRequest.ResourceType.OBJECT,
          chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
          chrome.declarativeNetRequest.ResourceType.PING,
          chrome.declarativeNetRequest.ResourceType.CSP_REPORT,
          chrome.declarativeNetRequest.ResourceType.MEDIA,
          chrome.declarativeNetRequest.ResourceType.WEBSOCKET,
          chrome.declarativeNetRequest.ResourceType.OTHER,
        ],
      },
    };
  });
}

// Function to set up ad blocking
async function setupAdBlocking() {
  if (enabled) {
    const rules = createRules();
    ruleIds = rules.map((rule) => rule.id);

    try {
      // Remove any existing rules
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
        addRules: rules,
      });

      console.log(`Added ${rules.length} ad blocking rules`);

      // Remove any existing listener
      if (navigationListener) {
        chrome.webNavigation.onCompleted.removeListener(navigationListener);
      }

      // Set up a new listener for when requests are blocked
      navigationListener = (details) => {
        // This is a simple approach - in a real extension, we would need
        // a more sophisticated way to determine if a request was blocked
        updateStats(details);
      };

      chrome.webNavigation.onCompleted.addListener(navigationListener);
    } catch (error) {
      console.error("Error setting up ad blocking rules:", error);
    }
  } else {
    // Remove all rules when disabled
    try {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
        addRules: [],
      });

      // Remove the navigation listener
      if (navigationListener) {
        chrome.webNavigation.onCompleted.removeListener(navigationListener);
        navigationListener = null;
      }

      console.log("Removed all ad blocking rules");
    } catch (error) {
      console.error("Error removing ad blocking rules:", error);
    }
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "toggleAdBlocking") {
    enabled = message.enabled;
    chrome.storage.local.set({ enabled });
    setupAdBlocking();
    sendResponse({ success: true });
  } else if (message.action === "getStats") {
    sendResponse({ stats });
  }
  return true; // Keep the message channel open for async responses
});

// Initialize the extension
function init() {
  console.log("AdBlocker Extension initialized");

  // Load settings from storage
  chrome.storage.local.get(["enabled", "stats", "uniqueDomains"], (result) => {
    if (result.enabled !== undefined) {
      enabled = result.enabled;
    }

    if (result.stats) {
      stats = result.stats;
    }

    // Load unique domains from storage if available
    uniqueDomains.clear(); // Always start with a clean set
    if (result.uniqueDomains && Array.isArray(result.uniqueDomains)) {
      result.uniqueDomains.forEach((domain: string) => {
        uniqueDomains.add(domain);
      });
    }

    // Always set pagesCount to match uniqueDomains.size
    stats.pagesCount = uniqueDomains.size;

    checkAndResetDailyStats();
    setupAdBlocking();
  });
}

// Start the extension
init();

// Statistics
interface Stats {
  todayCount: number;
  totalCount: number;
  lastResetDate: string;
}

// Default stats
const defaultStats: Stats = {
  todayCount: 0,
  totalCount: 0,
  lastResetDate: new Date().toDateString(),
};

// Extension state
let enabled = true;
let stats = { ...defaultStats };
let ruleIds: number[] = [];
let navigationListener: ((details: any) => void) | null = null;

let adDomains: string[] | null = null;

async function loadDomains(): Promise<string[]> {
  return fetch(chrome.runtime.getURL("domains.txt"))
    .then((response) => response.text())
    .then((text) => text.split("\n"))
    .then((lines) =>
      lines.filter((line) => line.trim() !== "" && !line.startsWith("#"))
    )
    .catch((error) => {
      console.error("Error loading domains:", error);
      return [];
    });
}

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

// Function to save stats to storage
function saveStats() {
  chrome.storage.local.set({ stats });
}

// Function to update stats when an ad is blocked
function updateStats() {
  // Increment counters
  stats.todayCount++;
  stats.totalCount++;
  saveStats();
}

// Convert ad domain patterns to declarativeNetRequest rules
async function createRules(): Promise<chrome.declarativeNetRequest.Rule[]> {
  if (!adDomains) {
    console.error("domains.txt is empty.");
    return [];
  }
  return adDomains.map((domain, index) => {
    const pattern = `*://${domain}/*`;
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
    const rules = await createRules();
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
      navigationListener = () => {
        // This is a simple approach - in a real extension, we would need
        // a more sophisticated way to determine if a request was blocked
        updateStats();
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
async function init() {
  console.log("AdBlocker Extension initialized");

  adDomains = await loadDomains();

  // Load settings from storage
  chrome.storage.local.get(["enabled", "stats"], (result) => {
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

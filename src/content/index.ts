// Common ad selectors
const adSelectors = [
  // Common ad class names and IDs
  ".ad",
  ".ads",
  ".adsbygoogle",
  ".advertisement",
  ".advertising",
  "#ad",
  "#ads",
  "#adunit",
  'iframe[src*="ad"]',
  'iframe[src*="doubleclick"]',
  'iframe[src*="googleadservices"]',
  'div[aria-label*="advertisement"]',
  "div[data-ad]",
  "div[data-adunit]",
  // id patterns
  '[id*="_ad_"]',
  '[id*="_ads_"]',
  '[id^="ad_"]',
  '[id^="ads_"]',
  '[id$="_ad"]',
  '[id$="_ads"]',
  '[id^="ad-"]',
  '[id^="ads-"]',
  '[id$="-ad"]',
  '[id$="-ads"]',
  // class patterns
  '[class*="_ad_"]',
  '[class*="_ads_"]',
  '[class^="ad_"]',
  '[class^="ads_"]',
  '[class$="_ad"]',
  '[class$="_ads"]',
  '[class*="-ad-"]',
  '[class*="-ads-"]',
  '[class^="ad-"]',
  '[class^="ads-"]',
  '[class$="-ad"]',
  '[class$="-ads"]',
];

// Function to hide ad elements
function hideAds() {
  // Create a style element
  const style = document.createElement("style");

  // Add CSS to hide ad elements
  style.textContent = adSelectors.join(", ") + " { display: none !important; }";

  // Add the style to the document
  document.head.appendChild(style);

  // Also remove elements that might be added dynamically
  const observer = new MutationObserver((_mutations) => {
    for (const selector of adSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        console.debug("Removing ad element", element);
        (element as HTMLElement).style.display = "none";
      });
    }
  });

  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Function to initialize ad blocking
function initialize() {
  // Initialize when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", () => {
    hideAds();
  });

  // Run immediately in case the DOM is already loaded
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    hideAds();
  }
}

// Check if ad blocking is enabled
chrome.storage.local.get(["enabled"], (result) => {
  const isEnabled = result.enabled !== undefined ? result.enabled : true;

  if (isEnabled) {
    console.log("AdBlocker content script running");
    initialize();
  } else {
    console.log("AdBlocker content script running, but disabled");
  }
});

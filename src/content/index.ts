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
  '[class*="ad-"]:not([class*="header"]):not([class*="navigation"])',
  '[id*="ad-"]:not([id*="header"]):not([id*="navigation"])',
  'iframe[src*="ad"]',
  'iframe[src*="doubleclick"]',
  'iframe[src*="googleadservices"]',
  'div[aria-label*="advertisement"]',
  "div[data-ad]",
  "div[data-adunit]",
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

// Initialize when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("AdBlocker content script running");
  hideAds();
});

// Run immediately in case the DOM is already loaded
if (
  document.readyState === "interactive" ||
  document.readyState === "complete"
) {
  hideAds();
}

# AdBlocker Extension Specification

## Overview

AdBlocker Extension is a browser extension designed to block advertisements on websites. It provides users with a cleaner browsing experience by preventing ad content from loading and removing ad elements from web pages.

## Features

-   Block network requests to known ad domains
-   Remove ad elements from web page DOM
-   Toggle ad blocking on/off via popup interface
-   Track and display statistics on blocked ads
-   Automatically reset daily statistics at midnight

## Technical Implementation

### Architecture

The extension consists of three main components:

1. **Background Script**: Runs persistently in the background to intercept and block network requests to ad domains.
2. **Content Script**: Injected into web pages to identify and remove ad elements from the DOM.
3. **Popup Interface**: Provides user controls and displays statistics.

### Ad Blocking Methods

The extension employs two complementary methods to block advertisements:

#### 1. Network Request Blocking (Background Script)

The background script uses the declarativeNetRequest API to block outgoing network requests that match known ad domain patterns. This prevents ad content from being downloaded in the first place, saving bandwidth and improving page load times.

```typescript
// Example of declarativeNetRequest rule creation
const rules = adDomainPatterns.map((pattern, index) => {
    return {
        id: index + 1,
        priority: 1,
        action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
            urlFilter: pattern,
            resourceTypes: [
                chrome.declarativeNetRequest.ResourceType.SCRIPT,
                chrome.declarativeNetRequest.ResourceType.IMAGE,
                // Other resource types...
            ],
        },
    };
});

// Apply the rules
chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: rules,
});
```

#### 2. DOM Element Removal (Content Script)

The content script scans the page DOM for elements matching common ad selectors and hides them. It also uses a MutationObserver to detect and hide dynamically added ad elements.

```typescript
// Example of DOM element hiding
const style = document.createElement("style");
style.textContent = adSelectors.join(", ") + " { display: none !important; }";
document.head.appendChild(style);
```

### State Management

The extension uses Chrome's storage API to persist settings and statistics across browser sessions:

-   `enabled`: Boolean flag indicating whether ad blocking is active
-   `stats`: Object containing statistics about blocked ads

Changes to these values are synchronized between the background script, content script, and popup interface using message passing and storage event listeners.

## User Interface

The popup interface provides:

-   Toggle switch to enable/disable ad blocking
-   Statistics display showing:
    -   Ads blocked today
    -   Total ads blocked
    -   Number of pages protected

## Statistics Tracking

The extension tracks the following statistics:

-   **Today Count**: Number of ads blocked since midnight
-   **Total Count**: Cumulative number of ads blocked since installation
-   **Pages Count**: Number of unique domains where ads have been blocked

Statistics are updated in real-time and persisted in Chrome storage.

## Future Improvements

Potential enhancements for future versions:

-   Custom filter lists
-   Whitelist functionality for trusted sites
-   Advanced statistics and visualizations
-   Element picker for custom ad blocking rules
-   Import/export settings
-   Performance optimizations

## Development

### Build Process

The extension is built using:

-   TypeScript for type-safe code
-   React for the popup interface
-   Vite for bundling and development workflow

### Project Structure

```
extension-adblocker/
├── src/
│   ├── assets/         # Icons and static assets
│   ├── background/     # Background script
│   ├── content/        # Content script
│   └── popup/          # Popup interface
├── manifest.json       # Extension manifest
└── package.json        # Project dependencies
```

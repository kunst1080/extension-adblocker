# Chrome AdBlocker Extension

A Chrome extension to block ads, built with TypeScript and Vite.

## Features

- Blocks common ad network requests
- Hides ad elements on web pages
- Toggle ad blocking on/off
- Tracks statistics (ads blocked today, total ads blocked, pages protected)

## Tech Stack

- TypeScript
- React
- Vite
- Chrome Extension API

## Project Structure

```
extension-adblocker/
├── src/
│   ├── assets/         # Extension icons
│   ├── background/     # Background service worker
│   ├── content/        # Content scripts
│   └── popup/          # Extension popup UI (React)
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Development

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

#### Build the Extension

```bash
npm run build
```

The built extension will be in the `dist` directory.

#### Run the Extension Locally

To run the extension in Chrome:

```bash
npm run start
```

This will build the extension and launch Chrome with the extension installed.

To run the extension in Firefox:

```bash
npm run start:firefox
```

#### Lint the Extension

```bash
npm run lint
```

#### Package the Extension for Distribution

```bash
npm run package
```

This will create a `.zip` file in the `web-ext-artifacts` directory that can be uploaded to the Chrome Web Store or Firefox Add-ons.

### Manual Loading in Chrome

If you prefer to load the extension manually:

1. Build the extension using `npm run build`
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the `dist` directory
5. The extension should now be installed and visible in your browser

## Adding Icons

Before building for production, add your icon files to the `src/assets` directory:

- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## License

MIT

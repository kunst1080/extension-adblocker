import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    webExtension({
      manifest: () => ({
        manifest_version: 3,
        name: 'AdBlocker Extension',
        version: '1.0.0',
        description: 'A Chrome extension to block ads',
        permissions: ['webRequest', 'webRequestBlocking', '<all_urls>', 'storage'],
        action: {
          default_popup: 'src/popup/index.html',
          default_icon: {
            '16': 'src/assets/icon16.png',
            '48': 'src/assets/icon48.png',
            '128': 'src/assets/icon128.png'
          }
        },
        background: {
          service_worker: 'src/background/index.ts',
          type: 'module'
        },
        content_scripts: [
          {
            matches: ['<all_urls>'],
            js: ['src/content/index.ts']
          }
        ],
        icons: {
          '16': 'src/assets/icon16.png',
          '48': 'src/assets/icon48.png',
          '128': 'src/assets/icon128.png'
        }
      })
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});

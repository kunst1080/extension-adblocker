import { defineConfig, Plugin } from "vite";
import path from "path";
import fs from "fs";

// Custom plugin to copy manifest.json to dist
const copyManifestPlugin = (): Plugin => {
  return {
    name: "copy-manifest",
    writeBundle() {
      const manifestContent = fs.readFileSync("manifest.json", "utf-8");
      fs.writeFileSync(
        path.resolve(__dirname, "dist/manifest.json"),
        manifestContent
      );
      console.log("Manifest copied to dist/manifest.json");
    },
  };
};

export default defineConfig({
  publicDir: "src/assets",
  plugins: [copyManifestPlugin()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "src/popup/index.html"),
        background: path.resolve(__dirname, "src/background/index.ts"),
        content: path.resolve(__dirname, "src/content/index.ts"),
      },
      output: {
        entryFileNames: "[name]/index.js",
        chunkFileNames: "[name]/[name].[hash].js",
        assetFileNames: "[name]/[name].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

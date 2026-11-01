import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const srcPath = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  // Relatív útvonalak: a dist mappa bármilyen alútvonalról kiszolgálható (pl. Live Server).
  base: "./",
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.MULTIPLAYER_API_TARGET ?? "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/ballistic-front/api": {
        target: process.env.MULTIPLAYER_API_TARGET ?? "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": srcPath,
      "@game": `${srcPath}/game`,
      "@ui": `${srcPath}/ui`,
    },
  },
  build: {
    // PixiJS szándékosan külön vendor chunk; a motor teljes renderer-készlete miatt nagy.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          pixi: ["pixi.js"],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Relatív útvonalak: a dist mappa bármilyen alútvonalról kiszolgálható (pl. Live Server).
  base: "./",
  plugins: [react()],
  resolve: {
    alias: { "@": new URL("./src", import.meta.url).pathname.replace(/^\/(\w:)/, "$1") },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});

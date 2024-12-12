import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [react(), wasm()],
  server: {
    hmr: {
      overlay: false,
    },
  },
  build: {
    target: "esnext", // Ensures compatibility with modern JavaScript features like top-level `await`
  },
});

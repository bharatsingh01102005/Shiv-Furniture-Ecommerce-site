import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
  },

  preview: {
    port: 4173,
  },

  build: {
    // Warn when a single chunk exceeds 500 kB (Vite default)
    chunkSizeWarningLimit: 500,
    // Do NOT emit source maps in production (reduces bundle size; keeps code private)
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split vendor libraries into a separate chunk for better browser caching
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },
});

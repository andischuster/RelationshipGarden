import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable chunking for faster build
      }
    },
    minify: 'esbuild', // Faster minification
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
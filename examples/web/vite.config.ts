import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Resolve the workspace packages to their TypeScript source so the example runs
// without building them first. Their `react-native` export condition is ignored
// by Vite (bundler conditions), and they import nothing from React Native.
const root = path.resolve(__dirname, "..", "..");

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@super-calendar/dom": path.join(root, "packages/dom/src/index.ts"),
      "@super-calendar/core": path.join(root, "packages/core/src/index.ts"),
    },
  },
});

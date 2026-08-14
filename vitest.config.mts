import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/unit/setup.ts",
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
    coverage: {
      provider: "v8",
      include: ["src/modules/*/domain/**/*.ts", "src/modules/*/application/**/*.ts"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90
      }
    }
  },
});

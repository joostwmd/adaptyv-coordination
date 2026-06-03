import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    passWithNoTests: false,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@adaptyv-coordination/ui": resolve(__dirname, "../../packages/ui/src"),
    },
  },
});

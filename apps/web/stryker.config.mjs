/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: "pnpm",
  testRunner: "vitest",
  plugins: ["@stryker-mutator/vitest-runner", "stryker-reporter-llm"],
  reporters: ["clear-text", "progress", "html", "json", "stryker-reporter-llm"],
  llmReporter: {
    outputPath: ".stryker-output/survivors.md",
  },
  vitest: {
    configFile: "vitest.config.ts",
  },
  mutate: [
    "src/domain/**/*.ts",
    "!src/domain/**/*.generated.ts",
    "!src/domain/**/index.ts",
  ],
  thresholds: {
    high: 80,
    low: 60,
    break: null,
  },
};

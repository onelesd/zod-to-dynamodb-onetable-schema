import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "<rootDir>/../test/utils/setup.ts",
    coverage: {
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
      exclude: configDefaults.coverage.exclude?.concat(["<rootDir>/../lib/**"]),
    },
  },
});

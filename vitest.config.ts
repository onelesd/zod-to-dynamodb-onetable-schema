import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "<rootDir>/../test/utils/setup.ts",
  },
});

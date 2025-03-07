import {defineConfig} from "vitest/config"

// https://vitest.dev/config/
export default defineConfig({
  test: {
    include: ["**/*_test.[jt]s"],
    testTimeout: 30000,
  },
})

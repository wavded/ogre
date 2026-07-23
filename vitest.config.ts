import {readFileSync} from "node:fs"

import {defineConfig} from "vitest/config"

// https://vitest.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "html-as-text",
      load(id) {
        if (id.endsWith(".html")) {
          return `export default ${JSON.stringify(readFileSync(id, "utf8"))}`
        }
        return null
      },
    },
  ],
  test: {
    include: ["**/*_test.[jt]s"],
    testTimeout: 30000,
  },
})

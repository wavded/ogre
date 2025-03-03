import {copyFileSync} from "node:fs"
import dts from "vite-plugin-dts"
import {defineConfig} from "vitest/config"

// https://vitest.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "index.ts",
      name: "ogr2ogr",
      formats: ["es", "cjs"],
    },
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      external: ["ogr2ogr"],
      treeshake: false,
    },
    target: "node18",
  },
  plugins: [
    dts({
      include: ["index.ts"],
      rollupTypes: true,
      insertTypesEntry: true,
      afterBuild: () => {
        copyFileSync("dist/ogr2ogr.d.ts", "dist/ogr2ogr.d.cts")
      },
    }),
  ],
  test: {
    include: ["**/*_test.[jt]s"],
    coverage: {
      reporter: ["text"],
    },
    testTimeout: 30000,
  },
})

import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    {
      // The source uses NodeNext-style ".js" specifiers that point at ".ts"
      // files; let Vite resolve them to the TS source during tests.
      name: "resolve-nodenext-js",
      enforce: "pre",
      async resolveId(source, importer) {
        if (importer && source.startsWith(".") && source.endsWith(".js")) {
          const resolved = await this.resolve(
            source.slice(0, -3) + ".ts",
            importer,
            { skipSelf: true },
          );
          if (resolved) return resolved;
        }
        return null;
      },
    },
  ],
  test: {
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.ts"],
  },
});

import { build } from "vite";
import { resolve } from "path";

async function main() {
  await build({
    build: {
      ssr: true,
      lib: {
        entry: resolve(process.cwd(), "tests/testSuite.ts"),
        formats: ["es"],
        fileName: () => "testSuite.js"
      },
      outDir: resolve(process.cwd(), "tests/dist"),
      emptyOutDir: true
    },
    configFile: false
  });

  // Now execute the built runner
  console.log("\n🚀 EXECUTING TEST SUITE:\n");
  await import("../tests/dist/testSuite.js");
}

main().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

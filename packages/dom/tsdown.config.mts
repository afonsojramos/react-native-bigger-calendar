import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  platform: "neutral",
  outDir: "dist",
  clean: true,
});

import { build, emptyDir } from "dnt/mod.ts";
import * as fs from "std/fs/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/mod.ts"],
  outDir: "./npm",
  importMap: "deno.json",
  shims: {
    deno: true,
  },
  package: {
    name: "svg-plotter",
    version: Deno.args[0],
    description: "Convert SVG to GeoJSON",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/LiamAttClarke/svg-plotter.git",
    },
    bugs: {
      url: "https://github.com/LiamAttClarke/svg-plotter/issues",
    },
    devDependencies: {
      // TODO: Remove when this issue is resolved: https://github.com/denoland/dnt/issues/297
      "@types/svg-path-parser": "1.1.3",
      "@types/geojson-validation": "1.0.0",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
    // Copy test files
    fs.copySync("tests/files", "npm/esm/src/tests/files");
    fs.copySync("tests/files", "npm/script/src/tests/files");
    // Delete unwanted node_modules outputs
    // Issue: https://github.com/denoland/dnt/issues/306
    Deno.removeSync("npm/esm/node_modules", { recursive: true });
    Deno.removeSync("npm/script/node_modules", { recursive: true });
  },
});

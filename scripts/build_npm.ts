import { build, emptyDir } from "dnt/mod.ts";

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
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});

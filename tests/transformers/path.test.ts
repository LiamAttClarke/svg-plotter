import * as svgson from "svgson";
import * as GeoJSONValidation from "geojson-validation";
import { assertEquals } from "std/testing/asserts.ts";
import { ConvertSVGOptions } from "../../src/types.ts";
import { getSVGMetadata } from "../../src/mod.ts";

// const SVG_PATH = Deno.readTextFileSync(
//   new URL("../files/path.svg", import.meta.url),
// );

const CONVERT_OPTIONS: ConvertSVGOptions = {
  center: { longitude: 0, latitude: 0 },
  width: 1000e3, // 1000km
  bearing: 0,
  subdivideThreshold: 5,
};

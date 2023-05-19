import * as svgson from "svgson";
import * as GeoJSONValidation from "geojson-validation";
import { assertEquals } from "std/testing/asserts.ts";
import { ConvertSVGOptions } from "../../src/types.ts";
import { getSVGMetadata } from "../../src/mod.ts";
import { line } from "../../src/transformers/index.ts";

const SVG_LINE = Deno.readTextFileSync(
  new URL("../files/line.svg", import.meta.url),
);

const CONVERT_OPTIONS: ConvertSVGOptions = {
  center: { longitude: 0, latitude: 0 },
  width: 1000e3, // 1000km
  bearing: 0,
  subdivideThreshold: 5,
};

Deno.test("transformer:line > should convert a SVG Line to a GeoJSON LineString", async () => {
  const parsedSVG = await svgson.parse(SVG_LINE, { camelcase: true });
  const { features } = line(
    parsedSVG.children[0],
    getSVGMetadata(parsedSVG),
    CONVERT_OPTIONS,
  );
  assertEquals(features.length, 1);
  const [lineFeature] = features;
  assertEquals(GeoJSONValidation.isFeature(lineFeature, true).length, 0);
  assertEquals(
    GeoJSONValidation.isLineString(lineFeature.geometry, true).length,
    0,
  );
  //   expect((lineFeature.geometry as GeoJsonObject).coordinates).to.deep.equal([[-90, 66.51326044311186], [90, -66.51326044311186]]);
});

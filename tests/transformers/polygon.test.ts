import * as svgson from "svgson";
import * as GeoJSONValidation from "geojson-validation";
import { assertEquals } from "std/testing/asserts.ts";
import { ConvertSVGOptions } from "../../src/types.ts";
import polygon from "../../src/transformers/polygon.ts";
import { getSVGMetadata } from "../../src/mod.ts";

const SVG_POLYGON = Deno.readTextFileSync(
  new URL("../files/polygon.svg", import.meta.url),
);

const CONVERT_OPTIONS: ConvertSVGOptions = {
  center: { longitude: 0, latitude: 0 },
  width: 1000e3, // 1000km
  bearing: 0,
  subdivideThreshold: 5,
};

Deno.test("transformer:polygon > should convert a SVG Polygon to a GeoJSON Polygon", async () => {
  const parsedSVG = await svgson.parse(SVG_POLYGON, { camelcase: true });
  const { features } = polygon(
    parsedSVG.children[0],
    getSVGMetadata(parsedSVG),
    CONVERT_OPTIONS,
  );
  assertEquals(features.length, 1);
  const [polygonFeature] = features;
  assertEquals(GeoJSONValidation.isFeature(polygonFeature, true).length, 0);
  assertEquals(
    GeoJSONValidation.isPolygon(polygonFeature.geometry, true).length,
    0,
  );
  //   expect(polygonFeature.geometry.coordinates).to.deep.equal([
  //     [
  //       [-122.39999999999999, -72.73278609432643],
  //       [-116.64, -80.73800862798672],
  //       [-99.36000000000001, -80.73800862798672],
  //       [-110.88, -83.22814054417216],
  //       [-105.12000000000002, -85.10173601678947],
  //       [-122.39999999999999, -84.21070904403568],
  //       [-139.68, -85.10173601678947],
  //       [-133.92, -83.22814054417216],
  //       [-145.44000000000003, -80.73800862798672],
  //       [-128.16, -80.73800862798672],
  //       [-122.39999999999999, -72.73278609432643],
  //     ],
  //   ]);
});

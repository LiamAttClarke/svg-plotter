import * as svgson from "svgson";
import * as GeoJSONValidation from "geojson-validation";
import { assertEquals } from "std/testing/asserts.ts";
import { ConvertSVGOptions } from "../../src/types.ts";
import polyline from "../../src/transformers/polyline.ts";
import { getSVGMetadata } from "../../src/mod.ts";

const SVG_POLYLINE = Deno.readTextFileSync(
  new URL("../files/polyline.svg", import.meta.url),
);

const CONVERT_OPTIONS: ConvertSVGOptions = {
  center: { longitude: 0, latitude: 0 },
  width: 1000e3, // 1000km
  bearing: 0,
  subdivideThreshold: 5,
};

Deno.test("transformer:polyline > should convert a SVG Polyline to a GeoJSON LineString", async () => {
  const parsedSVG = await svgson.parse(SVG_POLYLINE, { camelcase: true });
  const { features } = polyline(
    parsedSVG.children[0],
    getSVGMetadata(parsedSVG),
    CONVERT_OPTIONS,
  );
  assertEquals(features.length, 1);
  const [polylineFeature] = features;
  assertEquals(GeoJSONValidation.isFeature(polylineFeature, true).length, 0);
  assertEquals(
    GeoJSONValidation.isLineString(polylineFeature.geometry, true).length,
    0,
  );
  //   expect(polylineFeature.geometry.coordinates).to.deep.equal([
  //     [-110.88, -17.711014416582245],
  //     [-105.12000000000002, -33.841220320476765],
  //     [-99.36000000000001, -26.05283495188394],
  //     [-93.60000000000001, -47.422140992876095],
  //     [-87.84, -40.97989806962015],
  //     [-82.08, -58.22628219768537],
  //     [-76.32000000000001, -53.16258159476075],
  //     [-70.56, -66.51326044311186],
  //     [-64.80000000000001, -62.658000452319406],
  //   ]);
});

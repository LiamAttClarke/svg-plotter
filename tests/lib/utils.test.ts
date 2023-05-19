import {
  assertAlmostEquals,
  assertEquals,
  assertFalse,
  assertNotStrictEquals,
  assertObjectMatch,
  assertStrictEquals,
  assertThrows,
} from "std/testing/asserts.ts";
import GeoJSONValidation from "geojson-validation";
import { Vector2 } from "../../src/lib/Vector2.ts";
import {
  createFeature,
  parseSVGPointsString,
  svgPointToCoordinate,
} from "../../src/lib/utils.ts";
import { ConvertSVGOptions } from "../../src/types.ts";

const CONVERT_OPTIONS: ConvertSVGOptions = {
  center: { longitude: 0, latitude: 0 },
  width: 1000e3, // 1000km
  bearing: 0,
  subdivideThreshold: 5,
};

const SVG_META = {
  x: 0,
  y: 0,
  width: 512,
  height: 512,
};

Deno.test("parseSVGPointsString > should return a list of points given a comma delimited SVG points string", () => {
  const parsedPoints = parseSVGPointsString("1,2 3,-4 5.1,-6.01");
  assertEquals(parsedPoints.length, 3);
  assertObjectMatch(parsedPoints[0], { x: 1, y: 2 });
  assertObjectMatch(parsedPoints[1], { x: 3, y: -4 });
  assertObjectMatch(parsedPoints[2], { x: 5.1, y: -6.01 });
});

Deno.test("parseSVGPointsString > should return a list of points given a space delimited SVG points string", () => {
  const parsedPoints = parseSVGPointsString("1 2 3 -4 5.1 -6.01");
  assertEquals(parsedPoints.length, 3);
  assertObjectMatch(parsedPoints[0], { x: 1, y: 2 });
  assertObjectMatch(parsedPoints[1], { x: 3, y: -4 });
  assertObjectMatch(parsedPoints[2], { x: 5.1, y: -6.01 });
});

Deno.test("parseSVGPointsString > should ignore coordinates that are not a multiple of two", () => {
  const parsedPoints = parseSVGPointsString("1 2 3 4 5 6 7");
  assertEquals(parsedPoints.length, 3);
  assertObjectMatch(parsedPoints[0], { x: 1, y: 2 });
  assertObjectMatch(parsedPoints[1], { x: 3, y: 4 });
  assertObjectMatch(parsedPoints[2], { x: 5, y: 6 });
});

Deno.test("createFeature > should return a valid GeoJSON Feature", () => {
  const feature = createFeature(
    { type: "Point", coordinates: [0, 0] },
    "test",
    { a: 123 },
  );
  assertEquals(GeoJSONValidation.isFeature(feature, true).length, 0);
  assertObjectMatch(feature, {
    id: "test",
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
    properties: {
      a: 123,
    },
  });
});

Deno.test("createFeature > should return a GeoJSON Feature with no id property when id is null", () => {
  const feature = createFeature(
    { type: "Point", coordinates: [0, 0] },
    null,
    { a: 123 },
  );
  assertFalse("id" in feature);
});

Deno.test("createFeature > should return a GeoJSON Feature with properties=null when argument properties is null", () => {
  const feature = createFeature(
    { type: "Point", coordinates: [0, 0] },
    null,
    null,
  );
  assertStrictEquals(feature.properties, null);
});

// Deno.test("svgPointToCoordinate > should return the point projected with a mercator projection", () => {
//   const output1 = svgPointToCoordinate(
//     new Vector2(256, 256),
//     SVG_META,
//     CONVERT_OPTIONS,
//   );
//   assertAlmostEquals(output1[0], 0);
//   assertAlmostEquals(output1[1], 0);
//   const output2 = svgPointToCoordinate(
//     new Vector2(512, 512),
//     SVG_META,
//     CONVERT_OPTIONS,
//   );
//   assertAlmostEquals(output2[0], 180);
//   assertAlmostEquals(output2[1], -85.05112877980663);
// });

//   Deno.test("svgPointToCoordinate > should clamp latitudes that exceed (+/-)85 degrees", () => {
//     const coord1 = svgPointToCoordinate(
//       new Vector2(256, 512),
//       svgMeta,
//       DEFAULT_CONVERT_OPTIONS,
//     );
//     expect(Math.round(coord1[1])).to.equal(-85);
//     const coord2 = svgPointToCoordinate(
//       new Vector2(256, 0),
//       svgMeta,
//       DEFAULT_CONVERT_OPTIONS,
//     );
//     expect(Math.round(coord2[1])).to.equal(85);
//   });

//   Deno.test("svgPointToCoordinate > should clamp longitudes that exceed (+/-)180 degrees", () => {
//     const coord1 = svgPointToCoordinate(
//       new Vector2(600, 256),
//       svgMeta,
//       DEFAULT_CONVERT_OPTIONS,
//     );
//     expect(coord1[0]).to.equal(180);
//     const coord2 = svgPointToCoordinate(
//       new Vector2(-600, 256),
//       svgMeta,
//       DEFAULT_CONVERT_OPTIONS,
//     );
//     expect(coord2[0]).to.equal(-180);
//   });

//   Deno.test("svgPointToCoordinate > should scale coordinate to fit options.width", () => {
//     const convertOptions: ConvertSVGOptions = {
//       center: { longitude: 0, latitude: 0 },
//       width: EARTH_CIRCUMFERENCE / 2,
//     };
//     const coord1 = svgPointToCoordinate(
//       new Vector2(256, 256),
//       svgMeta,
//       convertOptions,
//     );
//     expect(coord1).to.deep.equal([0, 0]);
//     const coord2 = svgPointToCoordinate(
//       new Vector2(512, 256),
//       svgMeta,
//       convertOptions,
//     );
//     expect(coord2).to.deep.equal([90, 0]);
//   });

//   Deno.test("svgPointToCoordinate > should position the point relative to options.center", () => {
//     const convertOptions: ConvertSVGOptions = {
//       center: { longitude: 15, latitude: 15 },
//       width: EARTH_CIRCUMFERENCE,
//       subdivideThreshold: 10,
//     };
//     const coord1 = svgPointToCoordinate(
//       new Vector2(256, 256),
//       svgMeta,
//       convertOptions,
//     );
//     expect(coord1).to.roughly.deep.equal([15, 15]);
//   });

//   // TODO: Fill out this test case
//   Deno.test("svgPointToCoordinate > should return a point transformed by an SVG transform", () => {});
// });

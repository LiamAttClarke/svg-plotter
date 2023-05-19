import * as svgson from "svgson";
import * as GeoJSONValidation from "geojson-validation";
import { assertEquals } from "std/testing/asserts.ts";
import { ConvertSVGOptions } from "../../src/types.ts";
import rect from "../../src/transformers/rect.ts";
import { getSVGMetadata } from "../../src/mod.ts";

const SVG_RECT = Deno.readTextFileSync(
  new URL("../files/rect.svg", import.meta.url),
);

const CONVERT_OPTIONS: ConvertSVGOptions = {
  center: { longitude: 0, latitude: 0 },
  width: 1000e3, // 1000km
  bearing: 0,
  subdivideThreshold: 5,
};

Deno.test("transformer:rect > should convert a SVG Rect to a GeoJSON Polygon", async () => {
  const parsedSVG = await svgson.parse(SVG_RECT, { camelcase: true });
  const { features } = rect(
    parsedSVG.children[0],
    getSVGMetadata(parsedSVG),
    CONVERT_OPTIONS,
  );
  assertEquals(features.length, 1);
  const [rectFeature] = features;
  assertEquals(GeoJSONValidation.isFeature(rectFeature, true).length, 0);
  assertEquals(
    GeoJSONValidation.isPolygon(rectFeature.geometry, true).length,
    0,
  );
  //   expect(rectFeature.geometry.coordinates).to.deep.equal([[
  //     [-90, 66.51326044311186],
  //     [90, 66.51326044311186],
  //     [90, -66.51326044311186],
  //     [-90, -66.51326044311186],
  //     [-90, 66.51326044311186],
  //   ]]);
});

Deno.test("transformer:rect > should convert a rounded SVG Rect to a GeoJSON Polygon", async () => {
  const parsedSVG = await svgson.parse(SVG_RECT, { camelcase: true });
  const { features } = rect(
    parsedSVG.children[1],
    getSVGMetadata(parsedSVG),
    CONVERT_OPTIONS,
  );
  assertEquals(features.length, 1);
  const [rectFeature] = features;
  assertEquals(GeoJSONValidation.isFeature(rectFeature, true).length, 0);
  assertEquals(
    GeoJSONValidation.isPolygon(rectFeature.geometry, true).length,
    0,
  );
  //   expect(rectFeature.geometry.coordinates).to.deep.equal([[
  //     [-90, 40.979898069620134],
  //     [-83.40990257669732, 60.67484327381422],
  //     [-76.11037722821453, 65.1101218491444],
  //     [-67.5, 66.51326044311186],
  //     [71.88953224536287, 66.1662669326175],
  //     [76.11037722821452, 65.1101218491444],
  //     [83.40990257669732, 60.67484327381422],
  //     [90, 40.97989806962015],
  //     [83.40990257669732, -60.67484327381424],
  //     [76.11037722821452, -65.1101218491444],
  //     [67.5, -66.51326044311186],
  //     [-71.88953224536287, -66.1662669326175],
  //     [-76.11037722821452, -65.1101218491444],
  //     [-83.40990257669732, -60.67484327381424],
  //     [-90, -40.97989806962015],
  //     [-90, 40.979898069620134],
  //   ]]);
});

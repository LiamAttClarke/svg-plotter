import * as svgson from "svgson";
import * as GeoJSONValidation from "geojson-validation";
import { assertEquals } from "std/testing/asserts.ts";
import { getSVGMetadata } from "../../src/mod.ts";
import ellipse from "../../src/transformers/ellipse.ts";
import { ConvertSVGOptions } from "../../src/types.ts";

const SVG_CIRCLE = Deno.readTextFileSync(
  new URL("../files/circle.svg", import.meta.url),
);

const SVG_ELLIPSE = Deno.readTextFileSync(
  new URL("../files/ellipse.svg", import.meta.url),
);

const CONVERT_OPTIONS: ConvertSVGOptions = {
  center: { longitude: 0, latitude: 0 },
  width: 1000e3, // 1000km
  bearing: 0,
  subdivideThreshold: 5,
};

Deno.test("transformer:ellipse > should convert a SVG Circle to a GeoJSON Polygon", async () => {
  const parsedSVG = await svgson.parse(SVG_CIRCLE, { camelcase: true });
  const { features } = ellipse(
    parsedSVG.children[0],
    getSVGMetadata(parsedSVG),
    CONVERT_OPTIONS,
  );
  assertEquals(features.length, 1);
  const [ellipseFeature] = features;
  assertEquals(GeoJSONValidation.isFeature(ellipseFeature, true).length, 0);
  assertEquals(
    GeoJSONValidation.isPolygon(ellipseFeature.geometry, true).length,
    0,
  );
  //   expect(ellipseFeature.geometry.coordinates).to.deep.equal([[
  //     [90, 0],
  //     [83.14915792601583, -32.537020833713726],
  //     [63.63961030678928, -53.54434684391228],
  //     [34.44150891285806, -63.62879981868179],
  //     [0, -66.51326044311186],
  //     [-34.44150891285806, -63.62879981868179],
  //     [-63.63961030678928, -53.54434684391228],
  //     [-83.1491579260158, -32.537020833713726],
  //     [-90, 0],
  //     [-83.14915792601583, 32.537020833713726],
  //     [-63.63961030678929, 53.5443468439123],
  //     [-34.441508912858126, 63.62879981868177],
  //     [-1.9984014443252818e-14, 66.51326044311186],
  //     [34.44150891285811, 63.62879981868177],
  //     [63.63961030678928, 53.54434684391231],
  //     [83.14915792601579, 32.53702083371378],
  //     [90, 0],
  //   ]]);
});

Deno.test("should convert a SVG Ellipse to a GeoJSON Polygon", async () => {
  const parsedSVG = await svgson.parse(SVG_ELLIPSE, { camelcase: true });
  const svgMeta = getSVGMetadata(parsedSVG);
  const { features } = ellipse(
    parsedSVG.children[0],
    svgMeta,
    CONVERT_OPTIONS,
  );
  assertEquals(features.length, 1);
  const [ellipseFeature] = features;
  assertEquals(GeoJSONValidation.isFeature(ellipseFeature, true).length, 0);
  assertEquals(
    GeoJSONValidation.isPolygon(ellipseFeature.geometry, true).length,
    0,
  );
  //   expect(ellipseFeature.geometry.coordinates).to.deep.equal([[
  //     [90, 0],
  //     [88.27067523629073, -8.74491305102165],
  //     [83.14915792601583, -16.967185870864693],
  //     [63.63961030678928, -30.29995252677561],
  //     [0, -40.97989806962015],
  //     [-63.63961030678928, -30.29995252677561],
  //     [-83.1491579260158, -16.967185870864693],
  //     [-90, 0],
  //     [-88.27067523629073, 8.74491305102165],
  //     [-83.14915792601583, 16.967185870864668],
  //     [-63.63961030678929, 30.29995252677559],
  //     [-1.9984014443252818e-14, 40.979898069620134],
  //     [63.63961030678928, 30.29995252677561],
  //     [83.14915792601579, 16.967185870864693],
  //     [90, 0],
  //   ]]);
});

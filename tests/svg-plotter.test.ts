import { parseSync as parseSVG } from "svgson";
import * as GeoJSONValidation from "geojson-validation";
import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertObjectMatch,
  assertThrows,
} from "std/testing/asserts.ts";
import { convertSVG, getSVGMetadata } from "../src/mod.ts";

const SVG_SHAPES = Deno.readTextFileSync(
  new URL("./files/shapes.svg", import.meta.url),
);
const SVG_NO_DIMENSIONS = Deno.readTextFileSync(
  new URL("./files/no-dimensions.svg", import.meta.url),
);
const SVG_PATTERN = Deno.readTextFileSync(
  new URL("./files/pattern.svg", import.meta.url),
);
const SVG_VIEWBOX = Deno.readTextFileSync(
  new URL("./files/viewbox.svg", import.meta.url),
);

Deno.test("svg-plotter:getSVGMetadata > should parse svg dimensions given width, height, x, y attributes", () => {
  const parsedSVG = parseSVG(SVG_SHAPES, { camelcase: true });
  const meta = getSVGMetadata(parsedSVG);
  assertObjectMatch(meta, {
    x: 0,
    y: 0,
    width: 100,
    height: 250,
  });
});

Deno.test("svg-plotter:getSVGMetadata > should parse svg dimensions given a viewBox attribute", () => {
  const parsedSVG = parseSVG(SVG_VIEWBOX, { camelcase: true });
  const meta = getSVGMetadata(parsedSVG);
  assertObjectMatch(meta, {
    x: 128,
    y: 128,
    width: 128,
    height: 128,
  });
});

Deno.test("svg-plotter:convertSVG > should convert an SVG string to valid GeoJSON", async () => {
  const { geojson, errors } = await convertSVG(SVG_SHAPES);
  assertEquals(errors.length, 0);
  assertEquals(GeoJSONValidation.valid(geojson, true).length, 0);
});

Deno.test("svg-plotter:convertSVG > should set feature id based on options.idMapper", async () => {
  const { geojson, errors } = await convertSVG(SVG_SHAPES, {
    idMapper: (input) => input.attributes.id,
  });
  assertEquals(errors.length, 0);
  const expectedIds = [
    "alpha",
    "bravo",
    "charlie",
    "delta",
    "echo",
    "foxtrot",
    "golf",
    "hotel",
  ];
  geojson.features.forEach((f, i) => {
    assertEquals(f.id, expectedIds[i]);
  });
});

Deno.test("svg-plotter:convertSVG > should set feature properties based on options.propertyMapper", async () => {
  const { geojson, errors } = await convertSVG(SVG_SHAPES, {
    propertyMapper: (input) => ({ svgType: input.name }),
  });
  assertEquals(errors.length, 0);
  const expectedSVGType = [
    "rect",
    "rect",
    "circle",
    "ellipse",
    "line",
    "polyline",
    "polygon",
    "path",
  ];
  geojson.features.forEach((f, i) => {
    assert(f.properties);
    assertEquals(f.properties.svgType, expectedSVGType[i]);
  });
});

Deno.test("svg-plotter:convertSVG > should throw error if SVG does not have a width or height attribute", () => {
  assertThrows(
    convertSVG.bind(this, SVG_NO_DIMENSIONS),
    Error,
    "SVG must have a viewBox or width/height attributes.",
  );
});

Deno.test("svg-plotter:convertSVG > should return a list of errors that include all skipped geometry.", () => {
  const { geojson, errors } = convertSVG(SVG_PATTERN);
  assertArrayIncludes(errors, ["Skipping unsupported node: pattern"]);
});

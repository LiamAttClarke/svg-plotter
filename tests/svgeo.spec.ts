import "mocha";
import * as chai from "chai";
import { expect } from "chai";
import * as chaiRoughly from "chai-roughly";
import * as fs from "fs";
import * as path from "path";
import { mercator } from "projections";
import * as GeoJSONValidation from "geojson-validation";
import * as svgeo from "../src/svgeo";
import Vector2 from "../src/Vector2";

chai.use(chaiRoughly);

const TOLERANCE = 1e-6;

describe("svgeo", () => {

  describe("parseSVGPointsString", () => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/points

    it("should return a list of points given a comma delimited SVG points string", () => {
      const parsedPoints = svgeo.parseSVGPointsString("1,2 3,-4 5.1,-6.01");
      expect(parsedPoints.length).to.equal(3);
      expect(parsedPoints[0]).to.deep.equal(new Vector2(1, 2));
      expect(parsedPoints[1]).to.deep.equal(new Vector2(3, -4));
      expect(parsedPoints[2]).to.deep.equal(new Vector2(5.1, -6.01));
    });

    it("should return a list of points given a space delimited SVG points string", () => {
      const parsedPoints = svgeo.parseSVGPointsString("1 2 3 -4 5.1 -6.01");
      expect(parsedPoints.length).to.equal(3);
      expect(parsedPoints[0]).to.deep.equal(new Vector2(1, 2));
      expect(parsedPoints[1]).to.deep.equal(new Vector2(3, -4));
      expect(parsedPoints[2]).to.deep.equal(new Vector2(5.1, -6.01));
    });

    it("should ignore coordinates that are not a multiple of two", () => {
      const parsedPoints = svgeo.parseSVGPointsString("1 2 3 4 5 6 7");
      expect(parsedPoints.length).to.equal(3);
      expect(parsedPoints[0]).to.deep.equal(new Vector2(1, 2));
      expect(parsedPoints[1]).to.deep.equal(new Vector2(3, 4));
      expect(parsedPoints[2]).to.deep.equal(new Vector2(5, 6));
    });

  });

  describe("createFeature", () => {

    it("should return a valid GeoJSON Feature", () => {
      const feature = svgeo.createFeature({ type: "Point", coordinates: [0, 0] }, "test", { a: 123 });
      expect(GeoJSONValidation.isFeature(feature)).to.be.true;
      expect(feature).to.deep.equal({
        id:"test",
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [0, 0]
        },
        properties: {
          a: 123
        }
      });
    });

    it("should return a GeoJSON Feature with no id property when id is null", () => {
      const feature = svgeo.createFeature({ type: "Point", coordinates: [0, 0] }, null, { a: 123 });
      expect("id" in feature).to.be.false;
    });

    it("should return a GeoJSON Feature with properties=null when argument properties is null", () => {
      const feature = svgeo.createFeature({ type: "Point", coordinates: [0, 0] }, null, null);
      expect(feature.properties).to.equal(null);
    });

  });

  describe("svgPointToCoordinate", () => {

    const svgMeta:svgeo.SVGMetaData = { width: 512, height: 512 };

    it("should return the point projected with a mercator projection", () => {
      const convertOptions:svgeo.ConvertSVGOptions = {
        center: { longitude: 0, latitude: 0 },
        scale: 1
      };
      const coord1 = svgeo.svgPointToCoordinate(new Vector2(256, 256), svgMeta, convertOptions);
      const expectedCoord1 = mercator({ x: 0.5, y: 0.5 });
      expect(coord1).to.deep.equal([expectedCoord1.lon, expectedCoord1.lat]);
      const coord2 = svgeo.svgPointToCoordinate(new Vector2(384, 128), svgMeta, convertOptions);
      const expectedCoord2 = mercator({ x: 0.75, y: 0.25 });
      expect(coord2).to.deep.equal([expectedCoord2.lon, expectedCoord2.lat]);
    });

    it("should clamp latitudes that exceed (+/-)85 degrees", () => {
      const convertOptions:svgeo.ConvertSVGOptions = {
        center: { longitude: 0, latitude: 0 },
        scale: 1
      };
      const coord1 = svgeo.svgPointToCoordinate(new Vector2(256, 512), svgMeta, convertOptions);
      expect(Math.round(coord1[1])).to.equal(-85);
      const coord2 = svgeo.svgPointToCoordinate(new Vector2(256, 0), svgMeta, convertOptions);
      expect(Math.round(coord2[1])).to.equal(85);
    });

    it("should clamp longitudes that exceed (+/-)180 degrees", () => {
      const convertOptions:svgeo.ConvertSVGOptions = {
        center: { longitude: 0, latitude: 0 },
        scale: 1
      };
      const coord1 = svgeo.svgPointToCoordinate(new Vector2(600, 256), svgMeta, convertOptions);
      expect(coord1[0]).to.equal(180);
      const coord2 = svgeo.svgPointToCoordinate(new Vector2(-600, 256), svgMeta, convertOptions);
      expect(coord2[0]).to.equal(-180);
    });

    it("should scale the point by options.scale", () => {
      const convertOptions:svgeo.ConvertSVGOptions = {
        center: { longitude: 0, latitude: 0 },
        scale: 0.5
      };
      const coord1 = svgeo.svgPointToCoordinate(new Vector2(256, 256), svgMeta, convertOptions);
      const expectedCoord1 = mercator({ x: 0.5, y: 0.5 });
      expect(coord1).to.deep.equal([expectedCoord1.lon, expectedCoord1.lat]);
      const coord2 = svgeo.svgPointToCoordinate(new Vector2(512, 256), svgMeta, convertOptions);
      const expectedCoord2 = mercator({ x: 0.75, y: 0.5 });
      expect(coord2).to.deep.equal([expectedCoord2.lon, expectedCoord2.lat]);
    });

    it("should position the point relative to options.center", () => {
      const convertOptions:svgeo.ConvertSVGOptions = {
        center: { longitude: 15, latitude: 15 },
        scale: 1
      };
      const coord1 = svgeo.svgPointToCoordinate(new Vector2(256, 256), svgMeta, convertOptions);
      const expectedCoord1 = mercator({ x: 0.5, y: 0.5 });
      expect(coord1).to.deep.equal([expectedCoord1.lon + 15, expectedCoord1.lat + 15]);
      const coord2 = svgeo.svgPointToCoordinate(new Vector2(384, 128), svgMeta, convertOptions);
      const expectedCoord2 = mercator({ x: 0.75, y: 0.25 });
      expect(coord2).to.deep.equal([expectedCoord2.lon + 15, expectedCoord2.lat + 15]);
    });

    it("should return a point transformed by an SVG transform", () => {})

  });

  describe("lineTransformer", () => {});
  describe("rectTransformer", () => {});
  describe("polylineTransformer", () => {});
  describe("polygonTransformer", () => {});
  describe("ellipseTransformer", () => {});
  describe("pathTransformer", () => {});
  describe("groupTransformer", () => {});

  describe("convertSVG", () => {

    const svg_shapes = fs.readFileSync(path.join(__dirname, "files/test_shapes.svg"), "utf8");
    const svg_noDimensions = fs.readFileSync(path.join(__dirname, "files/test_no-dimensions.svg"), "utf8");

    it("should convert an SVG string to valid GeoJSON", async () => {
      const geoJSON = await svgeo.convertSVG(svg_shapes);
      fs.writeFileSync("./test.json", JSON.stringify(geoJSON));
      expect(GeoJSONValidation.valid(geoJSON)).to.be.true;
    });

    it("should set feature id based on options.idMapper", async () => {
      const geoJSON = await svgeo.convertSVG(svg_shapes, {
        idMapper: input => input.attributes.id
      });
      const expectedIds = ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel"];
      geoJSON.features.forEach((f, i) => {
        expect(f.id).to.equal(expectedIds[i]);
      });
    });

    it("should set feature properties based on options.propertyMapper", async () => {
      const geoJSON = await svgeo.convertSVG(svg_shapes, {
        propertyMapper: input => ({ svgType: input.name })
      });
      const expectedSVGType = ["rect", "rect", "circle", "ellipse", "line", "polyline", "polygon", "path"];
      geoJSON.features.forEach((f, i) => {
        expect(f.properties.svgType).to.equal(expectedSVGType[i]);
      });
    });

    it("should throw error if SVG does not have a width or height attribute", () => {
      return svgeo.convertSVG(svg_noDimensions)
        .then(() => {
          throw new Error("Error was not thrown for missing SVG width/height attributes.")
        })
        .catch(error => {
          expect(error.message).to.equal("SVG is missing width and height attributes.");
        });
    });

    // TODO: test options.center
    // TODO: test options.scale
    // TODO: test options.subdivideThreshold
    // TODO: test SVGs with width and heights of various units

  });

});


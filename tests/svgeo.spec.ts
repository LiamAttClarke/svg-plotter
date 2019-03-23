import "mocha";
import * as chai from "chai";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import * as GeoJSONValidation from "geojson-validation";
import * as chaiRoughly from "chai-roughly";
import * as svgeo from "../src/svgeo";
import Vector2 from "../src/Vector2";

console.log(GeoJSONValidation)

chai.use(chaiRoughly);

const TOLERANCE = 1e-6;

describe("svgeo", () => {

  describe("parseSVGPointsString", () => {
    // TODO: Update based on: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/points
    // TODO: test case when coordinates are comma and space delimited

    it("should return a list of points given an SVG points string", () => {
      const parsedPoints = svgeo.parseSVGPointsString("1,2 3,-4 5.1,-6.01");
      expect(parsedPoints.length).to.equal(3);
      expect(parsedPoints[0]).to.deep.equal(new Vector2(1, 2));
      expect(parsedPoints[1]).to.deep.equal(new Vector2(3, -4));
      expect(parsedPoints[2]).to.deep.equal(new Vector2(5.1, -6.01));
    });

  });

  describe("createFeature", () => {
    // TODO: test case when properties are null
    // TODO: test case when id is null

    it("should return a GeoJSON feature with a given geometry", () => {
      const feature = svgeo.createFeature({ type: "Point", coordinates: [0, 0] }, "test",{ a: 123 });
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

  });

  describe("svgPointToCoordinate", () => {});
  describe("groupTransformer", () => {});
  describe("lineTransformer", () => {});
  describe("rectTransformer", () => {});
  describe("polylineTransformer", () => {});
  describe("polygonTransformer", () => {});
  describe("ellipseTransformer", () => {});
  describe("pathTransformer", () => {});

  describe("convertSVG", () => {

    const svg1 = fs.readFileSync(path.join(__dirname, "files/test1.svg"), "utf8");

    it("should convert an SVG string to valid GeoJSON", async () => {
      const geoJSON = await svgeo.convertSVG(svg1);
      fs.writeFileSync("./test.json", JSON.stringify(geoJSON));
      expect(GeoJSONValidation.valid(geoJSON)).to.be.true;
    });

    // TODO: test options.idMapper
    // TODO: test options.propertyMapper
    // TODO: test options.center
    // TODO: test options.scale
    // TODO: test options.subdivideThreshold
    // TODO: test SVGs with width and heights of various units
    // TODO: test case when SVG does not have a width and height
    // TODO: test case when svg coordinate lies outside the artboard

  });

});


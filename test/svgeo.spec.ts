import "mocha";
import * as chai from "chai";
import { expect } from "chai";
import * as chaiRoughly from "chai-roughly";
import * as fs from "fs";
import * as path from "path";
import { mercator } from "projections";
import * as svgson from "svgson";
import * as GeoJSONValidation from "geojson-validation";
import * as svgeo from "../src/svgeo";
import * as mathUtils from "../src/math-utils";
import Vector2 from "../src/Vector2";
import { GeoJsonObject } from "geojson";

chai.use(chaiRoughly);

const defaultConvertOptions:svgeo.ConvertSVGOptions = {
  center: { longitude: 0, latitude: 0 },
  width: mathUtils.EARTH_CIRCUMFERENCE,
  subdivideThreshold: 10
};

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
      expect(GeoJSONValidation.isFeature(feature, geoJSONValdidationCallback)).to.be.true;
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

    // TODO: Add test case for svg with x/y and viewbox attributes

    const svgMeta:svgeo.SVGMetaData = { x: 0, y: 0, width: 512, height: 512 };

    it("should return the point projected with a mercator projection", () => {
      const coord1 = svgeo.svgPointToCoordinate(new Vector2(256, 256), svgMeta, defaultConvertOptions);
      expect(coord1).to.deep.equal([0, 0]);
      const coord2 = svgeo.svgPointToCoordinate(new Vector2(512, 512), svgMeta, defaultConvertOptions);
      expect(coord2).to.deep.equal([180, -85.05112877980663]);
    });

    it("should clamp latitudes that exceed (+/-)85 degrees", () => {
      const coord1 = svgeo.svgPointToCoordinate(new Vector2(256, 512), svgMeta, defaultConvertOptions);
      expect(Math.round(coord1[1])).to.equal(-85);
      const coord2 = svgeo.svgPointToCoordinate(new Vector2(256, 0), svgMeta, defaultConvertOptions);
      expect(Math.round(coord2[1])).to.equal(85);
    });

    it("should clamp longitudes that exceed (+/-)180 degrees", () => {
      const coord1 = svgeo.svgPointToCoordinate(new Vector2(600, 256), svgMeta, defaultConvertOptions);
      expect(coord1[0]).to.equal(180);
      const coord2 = svgeo.svgPointToCoordinate(new Vector2(-600, 256), svgMeta, defaultConvertOptions);
      expect(coord2[0]).to.equal(-180);
    });

    it("should scale coordinate to fit options.width", () => {
      const convertOptions:svgeo.ConvertSVGOptions = {
        center: { longitude: 0, latitude: 0 },
        width: mathUtils.EARTH_CIRCUMFERENCE / 2
      };
      const coord1 = svgeo.svgPointToCoordinate(new Vector2(256, 256), svgMeta, convertOptions);
      expect(coord1).to.deep.equal([0, 0]);
      const coord2 = svgeo.svgPointToCoordinate(new Vector2(512, 256), svgMeta, convertOptions);
      expect(coord2).to.deep.equal([90, 0]);
    });

    it("should position the point relative to options.center", () => {
      const convertOptions:svgeo.ConvertSVGOptions = {
        center: { longitude: 15, latitude: 15 },
        width: mathUtils.EARTH_CIRCUMFERENCE,
        subdivideThreshold: 10
      };
      const coord1 = svgeo.svgPointToCoordinate(new Vector2(256, 256), svgMeta, convertOptions);
      expect(coord1).to.roughly.deep.equal([15, 15]);
    });

    // TODO: Fill out this test case
    it("should return a point transformed by an SVG transform", () => {})

  });

  describe("lineTransformer", () => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line

    const svgLine = fs.readFileSync(path.join(__dirname, "files/line.svg"), "utf8");

    it("should convert a SVG Line to a GeoJSON LineString", async () => {
      const parsedSVG = await svgson.parse(svgLine, { camelcase: true });
      const svgMeta = svgeo.GetSVGMeta(parsedSVG);
      const features = svgeo.lineTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions);
      expect(features.length).to.equal(1);
      expect(GeoJSONValidation.isFeature(features[0], geoJSONValdidationCallback)).to.be.true;
      expect(GeoJSONValidation.isLineString(features[0].geometry, geoJSONValdidationCallback)).to.be.true;
      expect((features[0].geometry as GeoJsonObject).coordinates).to.deep.equal([[-90, 66.51326044311186], [90, -66.51326044311186]]);
    });

  });

  describe("rectTransformer", () => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect

    const svgRect = fs.readFileSync(path.join(__dirname, "files/rect.svg"), "utf8");

    it("should convert a SVG Rect to a GeoJSON Polygon", async () => {
      const parsedSVG = await svgson.parse(svgRect, { camelcase: true });
      const svgMeta = svgeo.GetSVGMeta(parsedSVG);
      const rect = svgeo.rectTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions)[0];
      expect(GeoJSONValidation.isFeature(rect, geoJSONValdidationCallback)).to.be.true;
      expect(GeoJSONValidation.isPolygon(rect.geometry, geoJSONValdidationCallback)).to.be.true;
      expect(rect.geometry.coordinates).to.deep.equal([[
        [-90, 66.51326044311186],
        [90, 66.51326044311186],
        [90, -66.51326044311186],
        [-90, -66.51326044311186],
        [-90, 66.51326044311186]
      ]]);
    });

    it("should convert a rounded SVG Rect to a GeoJSON Polygon", async () => {
      const parsedSVG = await svgson.parse(svgRect, { camelcase: true });
      const svgMeta = svgeo.GetSVGMeta(parsedSVG);
      const rect = svgeo.rectTransformer(parsedSVG.children[1], svgMeta, defaultConvertOptions)[0];
      expect(GeoJSONValidation.isFeature(rect, geoJSONValdidationCallback)).to.be.true;
      expect(GeoJSONValidation.isPolygon(rect.geometry, geoJSONValdidationCallback)).to.be.true;
      expect(rect.geometry.coordinates).to.deep.equal([[
        [-90, 40.979898069620134],
        [-83.40990257669732, 60.67484327381422],
        [-76.11037722821453, 65.1101218491444],
        [-67.5, 66.51326044311186],
        [71.88953224536287, 66.1662669326175],
        [76.11037722821452, 65.1101218491444],
        [83.40990257669732, 60.67484327381422],
        [90, 40.97989806962015],
        [83.40990257669732, -60.67484327381424],
        [76.11037722821452, -65.1101218491444],
        [67.5, -66.51326044311186],
        [-71.88953224536287, -66.1662669326175],
        [-76.11037722821452, -65.1101218491444],
        [-83.40990257669732, -60.67484327381424],
        [-90, -40.97989806962015],
        [-90, 40.979898069620134]
      ]]);
    });

  });

  describe("polylineTransformer", () => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline

    const svgPolyline = fs.readFileSync(path.join(__dirname, "files/polyline.svg"), "utf8");

    it("should convert a SVG Polyline to a GeoJSON LineString", async () => {
      const parsedSVG = await svgson.parse(svgPolyline, { camelcase: true });
      const svgMeta = svgeo.GetSVGMeta(parsedSVG);
      const features = svgeo.polylineTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions);
      expect(features.length).to.equal(1);
      expect(GeoJSONValidation.isFeature(features[0], geoJSONValdidationCallback)).to.be.true;
      expect(GeoJSONValidation.isLineString(features[0].geometry, geoJSONValdidationCallback)).to.be.true;
      expect(features[0].geometry.coordinates).to.deep.equal([
        [-72, -17.711014416582245],
        [-63, -33.841220320476765],
        [-53.999999999999986, -26.05283495188394],
        [-45, -47.422140992876095],
        [-35.99999999999999, -40.97989806962015],
        [-26.999999999999986, -58.22628219768537],
        [-18.000000000000014, -53.16258159476075],
        [-9.000000000000007, -66.51326044311186],
        [0, -62.658000452319406]
      ]);
    });

  });

  describe("polygonTransformer", () => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon

    const svgPolygon = fs.readFileSync(path.join(__dirname, "files/polygon.svg"), "utf8");

    it("should convert a SVG Polygon to a GeoJSON Polygon", async () => {
      const parsedSVG = await svgson.parse(svgPolygon, { camelcase: true });
      const svgMeta = svgeo.GetSVGMeta(parsedSVG);
      const features = svgeo.polygonTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions);
      expect(features.length).to.equal(1);
      expect(GeoJSONValidation.isFeature(features[0], geoJSONValdidationCallback)).to.be.true;
      expect(GeoJSONValidation.isPolygon(features[0].geometry, geoJSONValdidationCallback)).to.be.true;
      expect(features[0].geometry.coordinates).to.deep.equal([[
        [-90, -72.73278609432643],
        [-80.99999999999999, -80.73800862798672],
        [-53.999999999999986, -80.73800862798672],
        [-72, -83.22814054417216],
        [-63, -85.10173601678947],
        [-90, -84.21070904403568],
        [-116.99999999999999, -85.10173601678947],
        [-108, -83.22814054417216],
        [-126, -80.73800862798672],
        [-99.00000000000001, -80.73800862798672],
        [-90, -72.73278609432643]
      ]]);
    });

  });

  describe("ellipseTransformer", () => {
    // Circle reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
    // Ellipse reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/ellipse

    const svgCircle = fs.readFileSync(path.join(__dirname, "files/circle.svg"), "utf8");
    const svgEllipse = fs.readFileSync(path.join(__dirname, "files/ellipse.svg"), "utf8");

    it("should convert a SVG Circle to a GeoJSON Polygon", async () => {
      const parsedSVG = await svgson.parse(svgCircle, { camelcase: true });
      const svgMeta = svgeo.GetSVGMeta(parsedSVG);
      const features = svgeo.ellipseTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions);
      expect(features.length).to.equal(1);
      expect(GeoJSONValidation.isFeature(features[0], geoJSONValdidationCallback)).to.be.true;
      expect(GeoJSONValidation.isPolygon(features[0].geometry, geoJSONValdidationCallback)).to.be.true;
      expect(features[0].geometry.coordinates).to.deep.equal([[
        [90, 0],
        [83.14915792601583, -32.537020833713726],
        [63.63961030678928, -53.54434684391228],
        [34.44150891285806, -63.62879981868179],
        [0, -66.51326044311186],
        [-34.44150891285806, -63.62879981868179],
        [-63.63961030678928, -53.54434684391228],
        [-83.1491579260158, -32.537020833713726],
        [-90, 0],
        [-83.14915792601583, 32.537020833713726],
        [-63.63961030678929, 53.5443468439123],
        [-34.441508912858126, 63.62879981868177],
        [-1.9984014443252818e-14, 66.51326044311186],
        [34.44150891285811, 63.62879981868177],
        [63.63961030678928, 53.54434684391231],
        [83.14915792601579, 32.53702083371378],
        [90, 0]
      ]]);
    });

    it("should convert a SVG Ellipse to a GeoJSON Polygon", async () => {
      const parsedSVG = await svgson.parse(svgEllipse, { camelcase: true });
      const svgMeta = svgeo.GetSVGMeta(parsedSVG);
      const features = svgeo.ellipseTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions);
      expect(features.length).to.equal(1);
      expect(GeoJSONValidation.isFeature(features[0], geoJSONValdidationCallback)).to.be.true;
      expect(GeoJSONValidation.isPolygon(features[0].geometry, geoJSONValdidationCallback)).to.be.true;
      expect(features[0].geometry.coordinates).to.deep.equal([[
        [90, 0],
        [88.27067523629073, -8.74491305102165],
        [83.14915792601583, -16.967185870864693],
        [63.63961030678928, -30.29995252677561],
        [0, -40.97989806962015],
        [-63.63961030678928, -30.29995252677561],
        [-83.1491579260158, -16.967185870864693],
        [-90, 0],
        [-88.27067523629073, 8.74491305102165],
        [-83.14915792601583, 16.967185870864668],
        [-63.63961030678929, 30.29995252677559],
        [-1.9984014443252818e-14, 40.979898069620134],
        [63.63961030678928, 30.29995252677561],
        [83.14915792601579, 16.967185870864693],
        [90, 0]
      ]]);
    });

  });

  describe("pathTransformer", () => {
    // Reference:  https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
    // TODO: Add tests!
  });

  describe("groupTransformer", () => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/g
    // TODO: Add tests!
  });

  describe("convertSVG", () => {
    const svg_shapes = fs.readFileSync(path.join(__dirname, "files/shapes.svg"), "utf8");
    const svg_noDimensions = fs.readFileSync(path.join(__dirname, "files/no-dimensions.svg"), "utf8");

    it("should convert an SVG string to valid GeoJSON", async () => {
      const geoJSON = await svgeo.convertSVG(svg_shapes);
      expect(GeoJSONValidation.valid(geoJSON, geoJSONValdidationCallback)).to.be.true;
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
          throw new Error("Error was not thrown for missing SVG width/height/viewbox attributes.")
        })
        .catch(error => {
          expect(error.message).to.equal("SVG must have a viewbox or width/height attributes.");
        });
    });

  });

});

function geoJSONValdidationCallback(isValid, error) {
  if (!isValid) {
    console.error(error);
  }
}


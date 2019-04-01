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
import Vector2 from "../src/Vector2";
import { GeoJsonObject } from "geojson";

chai.use(chaiRoughly);

const defaultConvertOptions:svgeo.ConvertSVGOptions = {
  scale: 1,
  center: {
    longitude: 0,
    latitude: 0
  },
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

    // TODO: Add test case for svg with x/y and viewbox attributes

    const svgMeta:svgeo.SVGMetaData = { x: 0, y: 0, width: 512, height: 512 };

    it("should return the point projected with a mercator projection", () => {
      const coord1 = svgeo.svgPointToCoordinate(new Vector2(256, 256), svgMeta, defaultConvertOptions);
      const expectedCoord1 = mercator({ x: 0.5, y: 0.5 });
      expect(coord1).to.deep.equal([expectedCoord1.lon, expectedCoord1.lat]);
      const coord2 = svgeo.svgPointToCoordinate(new Vector2(384, 128), svgMeta, defaultConvertOptions);
      const expectedCoord2 = mercator({ x: 0.75, y: 0.25 });
      expect(coord2).to.deep.equal([expectedCoord2.lon, expectedCoord2.lat]);
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

  describe("lineTransformer", () => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/line

    const svgLine = fs.readFileSync(path.join(__dirname, "files/line.svg"), "utf8");

    it("should convert a SVG Line to a GeoJSON LineString", async () => {
      const parsedSVG = await svgson.parse(svgLine, { camelcase: true });
      const svgMeta:svgeo.SVGMetaData = {
        x: 0,
        y: 0,
        width: parseFloat(parsedSVG.attributes.width),
        height: parseFloat(parsedSVG.attributes.height)
      };
      const features = svgeo.lineTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions);
      expect(features.length).to.equal(1);
      expect(GeoJSONValidation.isFeature(features[0])).to.be.true;
      expect(GeoJSONValidation.isLineString(features[0].geometry)).to.be.true;
      expect((features[0].geometry as GeoJsonObject).coordinates).to.deep.equal([[-90, 66.27715161480374], [90, -66.74715120228447]]);
    });

  });

  describe("rectTransformer", () => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect

    const svgRect = fs.readFileSync(path.join(__dirname, "files/rect.svg"), "utf8");

    it("should convert a SVG Rect to a GeoJSON Polygon", async () => {
      const parsedSVG = await svgson.parse(svgRect, { camelcase: true });
      const svgMeta:svgeo.SVGMetaData = {
        x: 0,
        y: 0,
        width: parseFloat(parsedSVG.attributes.width),
        height: parseFloat(parsedSVG.attributes.height)
      };
      const features = svgeo.rectTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions);
      expect(features.length).to.equal(1);
      expect(GeoJSONValidation.isFeature(features[0])).to.be.true;
      expect(GeoJSONValidation.isPolygon(features[0].geometry)).to.be.true;
      expect(features[0].geometry.coordinates).to.deep.equal([[
        [-90, 66.27715161480374],
        [90, 66.27715161480374],
        [90, -66.74715120228447],
        [-90, -66.74715120228447],
        [-90, 66.27715161480374]
      ]]);
    });

  });

  describe("polylineTransformer", () => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polyline

    const svgPolyline = fs.readFileSync(path.join(__dirname, "files/polyline.svg"), "utf8");

    it("should convert a SVG Polyline to a GeoJSON LineString", async () => {
      const parsedSVG = await svgson.parse(svgPolyline, { camelcase: true });
      const svgMeta:svgeo.SVGMetaData = {
        x: 0,
        y: 0,
        width: parseFloat(parsedSVG.attributes.width),
        height: parseFloat(parsedSVG.attributes.height)
      };
      const features = svgeo.polylineTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions);
      expect(features.length).to.equal(1);
      expect(GeoJSONValidation.isFeature(features[0])).to.be.true;
      expect(GeoJSONValidation.isLineString(features[0].geometry)).to.be.true;
      expect(features[0].geometry.coordinates).to.deep.equal([
        [-72, -18.27182881120864],
        [-63, -34.329566962935075],
        [-53.999999999999986, -26.581366777928018],
        [-45, -47.81958166243998],
        [-35.99999999999999, -41.423544535420085],
        [-26.999999999999986, -58.53541562856473],
        [-18.000000000000014, -53.51464959455888],
        [-9.000000000000007, -66.74715120228447],
        [0, -62.9275917419856]
      ]);
    });

  });

  describe("polygonTransformer", () => {
    // Reference: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/polygon

    const svgPolygon = fs.readFileSync(path.join(__dirname, "files/polygon.svg"), "utf8");

    it("should convert a SVG Polygon to a GeoJSON Polygon", async () => {
      const parsedSVG = await svgson.parse(svgPolygon, { camelcase: true });
      const svgMeta:svgeo.SVGMetaData = {
        x: 0,
        y: 0,
        width: parseFloat(parsedSVG.attributes.width),
        height: parseFloat(parsedSVG.attributes.height)
      };
      const features = svgeo.polygonTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions);
      expect(features.length).to.equal(1);
      expect(GeoJSONValidation.isFeature(features[0])).to.be.true;
      expect(GeoJSONValidation.isPolygon(features[0].geometry)).to.be.true;
      expect(features[0].geometry.coordinates).to.deep.equal([[
        [-90, -72.9069533245733],
        [-80.99999999999999, -80.8324317832456],
        [-53.999999999999986, -80.8324317832456],
        [-72, -83.29731570170968],
        [-63, -85.10173601678947],
        [-90, -84.2698837069131],
        [-116.99999999999999, -85.10173601678947],
        [-108, -83.29731570170968],
        [-126, -80.8324317832456],
        [-99.00000000000001, -80.8324317832456],
        [-90, -72.9069533245733]
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
      const svgMeta:svgeo.SVGMetaData = {
        x: 0,
        y: 0,
        width: parseFloat(parsedSVG.attributes.width),
        height: parseFloat(parsedSVG.attributes.height)
      };
      const features = svgeo.ellipseTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions);
      expect(features.length).to.equal(1);
      expect(GeoJSONValidation.isFeature(features[0])).to.be.true;
      expect(GeoJSONValidation.isPolygon(features[0].geometry)).to.be.true;
      expect(features[0].geometry.coordinates).to.deep.equal([[
        [-148.359375, 77.49063100012613],
        [-149.42981907406002, 76.26998288998547],
        [-152.47818588956417, 75.1442488285283],
        [-157.04038923236592, 74.34226982668066],
        [-162.421875, 74.05075451479573],
        [-167.80336076763408, 74.34226982668066],
        [-172.36556411043583, 75.1442488285283],
        [-175.41393092593998, 76.26998288998547],
        [-176.48437500000003, 77.49063100012613],
        [-175.41393092593998, 78.60434071192854],
        [-172.36556411043583, 79.47143860215122],
        [-167.80336076763408, 80.01412765638977],
        [-162.421875, 80.19805080143433],
        [-157.04038923236592, 80.01412765638977],
        [-152.47818588956417, 79.47143860215122],
        [-149.42981907406005, 78.60434071192854],
        [-148.359375, 77.49063100012613]
      ]]);
    });

    it("should convert a SVG Ellipse to a GeoJSON Polygon", async () => {
      const parsedSVG = await svgson.parse(svgEllipse, { camelcase: true });
      const svgMeta:svgeo.SVGMetaData = {
        x: 0,
        y: 0,
        width: parseFloat(parsedSVG.attributes.width),
        height: parseFloat(parsedSVG.attributes.height)
      };
      const features = svgeo.ellipseTransformer(parsedSVG.children[0], svgMeta, defaultConvertOptions);
      expect(features.length).to.equal(1);
      expect(GeoJSONValidation.isFeature(features[0])).to.be.true;
      expect(GeoJSONValidation.isPolygon(features[0].geometry)).to.be.true;
      expect(features[0].geometry.coordinates).to.deep.equal([[
        [-113.20312499999999, 77.49063100012613],
        [-113.27083978117223, 77.41577320923906],
        [-113.47333199432956, 77.34120200300026],
        [-114.27356907406003, 77.19586011023722],
        [-117.32193588956417, 76.94062403087021],
        [-127.265625, 76.70590373615683],
        [-141.328125, 77.49063100012613],
        [-141.2604102188278, 77.56505055287148],
        [-141.05791800567044, 77.6383238747957],
        [-140.25768092594, 77.77872154588538],
        [-137.20931411043583, 78.01782803039414],
        [-127.265625, 78.22973324675914],
        [-113.20312499999999, 77.49063100012613]
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
          throw new Error("Error was not thrown for missing SVG width/height/viewbox attributes.")
        })
        .catch(error => {
          expect(error.message).to.equal("SVG must have a viewbox or width/height attributes.");
        });
    });

  });

});


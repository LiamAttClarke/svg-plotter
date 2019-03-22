// import "mocha";
// import * as chai from "chai";
// import { expect } from "chai";
// import * as chaiRoughly from "chai-roughly";
// import * as svgeo from "../src/svgeo";
// import Vector2 from "../src/Vector2";

// chai.use(chaiRoughly);

// const TOLERANCE = 1e-6;

// describe("parseSVGPointsString", () => {

//   it("should return a list of points given an SVG points string", () => {
//     const parsedPoints = svgeo.parseSVGPointsString("1,2 3,-4 5.1,-6.01");
//     expect(parsedPoints.length).to.equal(3);
//     expect(parsedPoints[0]).to.deep.equal(new Vector2(1, 2));
//     expect(parsedPoints[1]).to.deep.equal(new Vector2(3, -4));
//     expect(parsedPoints[2]).to.deep.equal(new Vector2(5.1, -6.01));
//   });

// });

// describe("createFeature", () => {
//   it("should return a GeoJSON feature with a given geometry", () => {
//     const feature = svgeo.createFeature({ type: "Point", coordinates: [0, 0] }, "test",{ a: 123 });
//     expect(feature).to.deep.equal({
//       id:"test",
//       type: "Feature",
//       geometry: {
//         type: "Point",
//         coordinates: [0, 0]
//       },
//       properties: {
//         a: 123
//       }
//     });
//   });
// });

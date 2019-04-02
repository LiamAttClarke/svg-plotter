import "mocha";
import * as chai from "chai";
import { expect } from "chai";
import * as chaiRoughly from "chai-roughly";
import * as mathUtils from "../src/math-utils";
import Vector2 from "../src/Vector2";

chai.use(chaiRoughly);

const TOLERANCE = 1e-6;

describe("mathUtils", () => {

  describe("clamp", () => {

    it("should return n when n >= min and n <= max", () => {
      expect(mathUtils.clamp(0, 0, 1)).to.equal(0);
      expect(mathUtils.clamp(0.5, 0, 1)).to.equal(0.5);
      expect(mathUtils.clamp(1, 0, 1)).to.equal(1);
    });

    it("should return min when n < min", () => {
      expect(mathUtils.clamp(-1, 0, 1)).to.equal(0);
    });

    it("should return max when n > max", () => {
      expect(mathUtils.clamp(2, 0, 1)).to.equal(1);
    });

  });

  describe("lerp", () => {

    it("should return a number t percent between a and b", () => {
      expect(mathUtils.lerp(1, 3, 0.5)).to.equal(2);
      expect(mathUtils.lerp(0, 10, 1)).to.equal(10);
      expect(mathUtils.lerp(-3, 3, 0.5)).to.equal(0);
    });

  });

  describe("toRadians", () => {

    it("should return an angle in radians given an angle in degrees", () => {
      expect(mathUtils.toRadians(180)).to.equal(Math.PI);
      expect(mathUtils.toRadians(-360)).to.equal(Math.PI * -2);
    });

  });

  describe("toDegrees", () => {

    it("should return an angle in degrees given an angle in radians", () => {
      expect(mathUtils.toDegrees(Math.PI)).to.equal(180);
      expect(mathUtils.toDegrees(Math.PI * -2)).to.equal(-360);
    });

  });

  describe("pointOnLine", () => {

    it("should return a point along a line", () => {
      const pointA = new Vector2(1, 3);
      const pointB = new Vector2(3, 1);
      expect(mathUtils.pointOnLine(pointA, pointB, 0)).to.roughly.deep.equal(new Vector2(1, 3));
      expect(mathUtils.pointOnLine(pointA, pointB, 0.5)).to.roughly.deep.equal(new Vector2(2, 2));
      expect(mathUtils.pointOnLine(pointA, pointB, 1)).to.roughly.deep.equal(new Vector2(3, 1));
    });

    it("should return the start or end point when t is out of range [0,1]", () => {
      const pointA = new Vector2(1, 3);
      const pointB = new Vector2(3, 1);
      expect(mathUtils.pointOnLine(pointA, pointB, -1)).to.roughly.deep.equal(new Vector2(1, 3));
      expect(mathUtils.pointOnLine(pointA, pointB, 2)).to.roughly.deep.equal(new Vector2(3, 1));
    });

  });

  describe("pointOnEllipse", () => {

    it("should return a point along an ellipse", () => {
      const center = new Vector2(0, 0);
      const r = 1;

      const result1 = mathUtils.pointOnEllipse(center, r, r, 0);
      expect(result1.x).to.be.closeTo(1, TOLERANCE);
      expect(result1.y).to.be.closeTo(0, TOLERANCE);

      const result2 = mathUtils.pointOnEllipse(center, r, r, 0.25);
      expect(result2.x).to.be.closeTo(0, TOLERANCE);
      expect(result2.y).to.be.closeTo(1, TOLERANCE);

      const result3 = mathUtils.pointOnEllipse(center, r, r, 0.5);
      expect(result3.x).to.be.closeTo(-1, TOLERANCE);
      expect(result3.y).to.be.closeTo(0, TOLERANCE);

      const result4 = mathUtils.pointOnEllipse(center, r, r, 0.75);
      expect(result4.x).to.be.closeTo(0, TOLERANCE);
      expect(result4.y).to.be.closeTo(-1, TOLERANCE);

      const result5 = mathUtils.pointOnEllipse(center, r, r, 1);
      expect(result5.x).to.be.closeTo(1, TOLERANCE);
      expect(result5.y).to.be.closeTo(0, TOLERANCE);
    });

  });

  describe("pointOnCubicBezierCurve", () => {

    it("should return a point along a cubic bezier curve", () => {
      const p0 = new Vector2(0, 0);
      const p1 = new Vector2(0, 1);
      const p2 = new Vector2(1, 0);
      const p3 = new Vector2(1, 1);

      const result1 = mathUtils.pointOnCubicBezierCurve(p0, p1, p2, p3, 0);
      expect(result1).to.roughly.deep.equal(new Vector2(0, 0));

      const result2 = mathUtils.pointOnCubicBezierCurve(p0, p1, p2, p3, 0.5);
      expect(result2).to.roughly.deep.equal(new Vector2(0.5, 0.5));

      const result3 = mathUtils.pointOnCubicBezierCurve(p0, p1, p2, p3, 1);
      expect(result3).to.roughly.deep.equal(new Vector2(1, 1));

    });

  });

  describe("pointOnQuadraticBezierCurve", () => {

    it("should return a point along a quadratic bezier curve", () => {
      const p0 = new Vector2(0, 0);
      const p1 = new Vector2(0.5, 0.5);
      const p2 = new Vector2(1, 1);

      const result1 = mathUtils.pointOnQuadraticBezierCurve(p0, p1, p2, 0);
      expect(result1).to.roughly.deep.equal(new Vector2(0, 0));

      const result2 = mathUtils.pointOnQuadraticBezierCurve(p0, p1, p2, 0.5);
      expect(result2).to.roughly.deep.equal(new Vector2(0.5, 0.5));

      const result3 = mathUtils.pointOnQuadraticBezierCurve(p0, p1, p2, 1);
      expect(result3).to.roughly.deep.equal(new Vector2(1, 1));

    });

  });

  describe("pointOnEllipticalArc", () => {

    const arc1 = (t:number) => {
      return mathUtils.pointOnEllipticalArc(new Vector2(40, 50), new Vector2(120, 80), 3, 1, 0, false, false, t);
    };
    const arc2 = (t:number) => {
      return mathUtils.pointOnEllipticalArc(new Vector2(250, 100), new Vector2(250, 200), 120, 80, 45, true, true, t);
    };
    const arc3 = (t:number, largeArcFlag=false, sweepFlag=false) => {
      return mathUtils.pointOnEllipticalArc(new Vector2(250, 100), new Vector2(250, 200), 120, 80, 0, largeArcFlag, sweepFlag, t);
    };

    it("should return starting point if t = 0", () => {
      expect(arc1(0)).to.roughly.deep.equal(new Vector2(40, 50));
      expect(arc2(0)).to.roughly.deep.equal(new Vector2(250, 100));
      expect(arc3(0)).to.roughly.deep.equal(new Vector2(250, 100));
    });

    it("should return end point if t = 1", () => {
      expect(arc1(1)).to.roughly.deep.equal(new Vector2(120, 80));
      expect(arc2(1)).to.roughly.deep.equal(new Vector2(250, 200));
      expect(arc3(1)).to.roughly.deep.equal(new Vector2(250, 200));
    });

    it("should return values along a given arc", () => {
      expect(arc1(0.35)).to.roughly.deep.equal(new Vector2(21.7450864219, 70.07022949308));
      expect(arc1(0.82)).to.roughly.deep.equal(new Vector2(89.660911246025, 84.80927614891685));
      expect(arc2(0.5)).to.roughly.deep.equal(new Vector2(438.38624784078576, 222.45624916953307));
    });

    it("should return a point along a straight line when rx or ry is 0", () => {
      const result1 = mathUtils.pointOnEllipticalArc(new Vector2(0, 0), new Vector2(10, 20), 0, 80, 45, true, true, 0.5);
      const result2 = mathUtils.pointOnEllipticalArc(new Vector2(0, 0), new Vector2(10, 20), 120, 0, 45, true, true, 0.5);
      expect(result1).to.roughly.deep.equal(new Vector2(5, 10));
      expect(result2).to.roughly.deep.equal(new Vector2(5, 10));
    });

    it("should sample properly with largeArc=false and sweep=false", () => {
      expect(arc3(0.5, false, false)).to.roughly.deep.equal(new Vector2(223.67496997597596, 150));
    });

    it("should sample properly with largeArc=true and sweep=true", () => {
      expect(arc3(0.5, true, true)).to.roughly.deep.equal(new Vector2(463.67496997597596, 150));
    });

    it("should sample properly with largeArc=true and sweep=false", () => {
      expect(arc3(0.5, true, false)).to.roughly.deep.equal(new Vector2(36.325030024024045, 150));
    });

    it("should sample properly with largeArc=false and sweep=true", () => {
      expect(arc3(0.5, false, true)).to.roughly.deep.equal(new Vector2(276.32503002402404, 150));
    });

  });

  describe("drawCurve", () => {

    it("should return a list of points where the first element is the start position of the curve", () => {
      const center = new Vector2(0, 0);
      const r = 1;
      const curveStart = mathUtils.pointOnEllipse(center, r, r, 0);
      const curve = mathUtils.drawCurve((t:number) => mathUtils.pointOnEllipse(center, r, r, t), 1, 0, 1);
      expect(curve[0]).to.roughly.deep.equal(curveStart);
    })

    it("should return a list of points where the last element is the end position of the curve", () => {
      const center = new Vector2(0, 0);
      const r = 1;
      const curveEnd = mathUtils.pointOnEllipse(center, r, r, 1);
      const curve = mathUtils.drawCurve((t:number) => mathUtils.pointOnEllipse(center, r, r, t), 1, 0, 1);
      expect(curve[curve.length - 1]).to.roughly.deep.equal(curveEnd);
    })

    it("should return at least the start and end points of the curve", () => {
      const p0 = new Vector2(0, 0);
      const p1 = new Vector2(2, 8);
      const p2 = new Vector2(4, 0);
      const curve = mathUtils.drawCurve((t:number) => mathUtils.pointOnQuadraticBezierCurve(p0, p1, p2, t), 90, 0, 1);
      expect(curve.length).to.be.greaterThan(1);
      expect(curve[0]).to.roughly.deep.equal(p0);
      expect(curve[curve.length - 1]).to.roughly.deep.equal(p2);
    });

    it("should return an ordered list of points along a curve", () => {
      const curve = mathUtils.drawCurve((t:number) => mathUtils.pointOnEllipse(new Vector2(0, 0), 1, 1, t), 33);
      const expectedCurve = [
        new Vector2(1, 0),
        new Vector2(0, 1),
        new Vector2(-1, 0),
        new Vector2(0, -1),
        new Vector2(1, 0)
      ]
      expect(curve.length).to.equal(5);
      curve.forEach((point, i) => {
        const expectedPoint = expectedCurve[i];
        expect(point.x).to.be.closeTo(expectedPoint.x, TOLERANCE);
        expect(point.y).to.be.closeTo(expectedPoint.y, TOLERANCE);
      });
    })

  })

})

describe("haversineDistance", () => {
  // Reference: https://en.wikipedia.org/wiki/Haversine_formula

  it("should return the great-cirlce distance (in metres) between two coordinates", () => {
    const coordA = { latitude: 0, longitude: 0 };
    const coordB = { latitude: 43.6529, longitude: -79.3849 };
    expect(mathUtils.haversineDistance(coordA, coordB)).to.equal(9155865.3400348);
  })

});
